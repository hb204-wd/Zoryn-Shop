"""
Module d'analyse de segmentation pour le projet Zoryn.

Ce module segmente les utilisateurs par device, type d'utilisateur,
source, catégorie, valeur de panier et niveau d'engagement,
puis calcule les KPIs par segment.
"""

import pandas as pd
import numpy as np
from typing import Optional, Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_data_from_mysql(
    host: str = "localhost",
    port: int = 3306,
    dbname: str = "zoryn_project",
    user: str = "root",
    password: str = "",
    query: Optional[str] = None,
    table: str = "analytics_events",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> pd.DataFrame:
    """
    Charge les données depuis une base MySQL.

    Args:
        host: Adresse de l'hôte de la base de données.
        port: Port de la base de données.
        dbname: Nom de la base de données.
        user: Nom d'utilisateur.
        password: Mot de passe.
        query: Requête SQL personnalisée.
        table: Nom de la table à charger.
        start_date: Date de début au format 'YYYY-MM-DD'.
        end_date: Date de fin au format 'YYYY-MM-DD'.

    Returns:
        DataFrame pandas contenant les données chargées.
    """
    try:
        import pymysql

        conn = pymysql.connect(
            host=host, port=port, database=dbname, user=user, password=password
        )

        if query is None:
            query = f"SELECT * FROM {table}"
            conditions = []
            if start_date:
                conditions.append(f"event_timestamp >= '{start_date}'")
            if end_date:
                conditions.append(f"event_timestamp < '{end_date}'")
            if conditions:
                query += " WHERE " + " AND ".join(conditions)

        df = pd.read_sql_query(query, conn)
        conn.close()
        logger.info(f"Chargé {len(df)} lignes depuis MySQL.")
        return df

    except ImportError:
        logger.error("pymysql n'est pas installé. Utilisez 'pip install pymysql'.")
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"Erreur lors du chargement MySQL: {e}")
        return pd.DataFrame()


def load_data_from_csv(file_path: str) -> pd.DataFrame:
    """
    Charge les données depuis un fichier CSV.

    Args:
        file_path: Chemin vers le fichier CSV.

    Returns:
        DataFrame pandas contenant les données chargées.
    """
    try:
        df = pd.read_csv(file_path, parse_dates=["event_timestamp"])
        logger.info(f"Chargé {len(df)} lignes depuis {file_path}.")
        return df
    except FileNotFoundError:
        logger.error(f"Fichier non trouvé: {file_path}")
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"Erreur lors du chargement CSV: {e}")
        return pd.DataFrame()


def calculate_segment_kpis(df: pd.DataFrame, segment_column: str) -> pd.DataFrame:
    """
    Calcule les KPIs pour un segment donné.

    Args:
        df: DataFrame contenant les données d'événements.
        segment_column: Nom de la colonne de segmentation.

    Returns:
        DataFrame avec les KPIs calculés par segment.
    """
    if df.empty or segment_column not in df.columns:
        logger.warning(f"Colonne {segment_column} non trouvée ou DataFrame vide.")
        return pd.DataFrame()

    results = []

    for segment_val, group in df.groupby(segment_column):
        row = {segment_column: segment_val}

        # Compter les utilisateurs uniques
        row["unique_users"] = group["user_id"].nunique()

        # Compter les événements par type
        for event_type in ["view", "add_to_cart", "checkout", "purchase"]:
            event_users = group[group["event_type"] == event_type]["user_id"].nunique()
            row[f"{event_type}_users"] = event_users

        # Calculer les taux de conversion
        views = row.get("view_users", 0)
        cart = row.get("add_to_cart_users", 0)
        checkout = row.get("checkout_users", 0)
        purchase = row.get("purchase_users", 0)

        row["view_to_cart_rate"] = round((cart / views * 100), 2) if views > 0 else 0.0
        row["cart_to_checkout_rate"] = (
            round((checkout / cart * 100), 2) if cart > 0 else 0.0
        )
        row["checkout_to_purchase_rate"] = (
            round((purchase / checkout * 100), 2) if checkout > 0 else 0.0
        )
        row["overall_conversion_rate"] = (
            round((purchase / views * 100), 2) if views > 0 else 0.0
        )

        # Calculer le revenu
        purchase_data = group[group["event_type"] == "purchase"]
        row["total_revenue"] = round(
            (purchase_data["price"] * purchase_data["quantity"]).sum(), 2
        )
        row["avg_order_value"] = (
            round(
                purchase_data.groupby("order_id")
                .apply(lambda x: (x["price"] * x["quantity"]).sum())
                .mean(),
                2,
            )
            if not purchase_data.empty
            else 0.0
        )

        # Nombre moyen d'items par commande
        row["avg_items_per_order"] = (
            round(
                purchase_data.groupby("order_id")["quantity"].sum().mean(), 2
            )
            if not purchase_data.empty
            else 0.0
        )

        results.append(row)

    return pd.DataFrame(results)


def segment_by_device(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par type d'appareil.

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par device.
    """
    return calculate_segment_kpis(df, "device_type")


def segment_by_user_type(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par type d'utilisateur (nouveau, récurrent, connecté).

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par type d'utilisateur.
    """
    if df.empty:
        return pd.DataFrame()

    df = df.copy()

    # Calculer le premier événement de chaque utilisateur
    user_first_event = df.groupby("user_id")["event_timestamp"].min().reset_index()
    user_first_event.columns = ["user_id", "first_event"]

    # Joindre pour déterminer le type d'utilisateur
    df = df.merge(user_first_event, on="user_id", how="left")
    df["user_type"] = np.where(
        df["event_timestamp"] == df["first_event"], "new", "returning"
    )

    # Statut d'authentification
    df["auth_status"] = np.where(df["user_id"].notna(), "logged-in", "anonymous")

    # Calculer les KPIs par type d'utilisateur et statut
    results = []
    for (user_type, auth_status), group in df.groupby(["user_type", "auth_status"]):
        row = {"user_type": user_type, "auth_status": auth_status}
        row["unique_users"] = group["user_id"].nunique()

        for event_type in ["view", "add_to_cart", "checkout", "purchase"]:
            row[f"{event_type}_users"] = group[group["event_type"] == event_type][
                "user_id"
            ].nunique()

        views = row.get("view_users", 0)
        purchase = row.get("purchase_users", 0)
        row["conversion_rate"] = (
            round((purchase / views * 100), 2) if views > 0 else 0.0
        )

        results.append(row)

    return pd.DataFrame(results)


def segment_by_source(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par source de trafic.

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par source.
    """
    return calculate_segment_kpis(df, "traffic_source")


def segment_by_category(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par catégorie de produit.

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par catégorie.
    """
    return calculate_segment_kpis(df, "product_category")


def segment_by_cart_value(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par valeur de panier (faible, moyenne, élevée).

    Les segments sont définis comme suit :
    - Faible : < 50
    - Moyenne : 50-200
    - Élevée : > 200

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par segment de valeur de panier.
    """
    if df.empty:
        return pd.DataFrame()

    # Calculer la valeur du panier par utilisateur
    cart_data = df[df["event_type"] == "add_to_cart"].copy()
    if cart_data.empty:
        logger.warning("Aucune donnée de panier trouvée.")
        return pd.DataFrame()

    cart_values = (
        cart_data.groupby("user_id")
        .agg(cart_total=("price", lambda x: (x * cart_data.loc[x.index, "quantity"]).sum()))
        .reset_index()
    )

    # Créer les segments
    cart_values["cart_value_segment"] = pd.cut(
        cart_values["cart_total"],
        bins=[0, 50, 200, float("inf")],
        labels=["low", "medium", "high"],
        include_lowest=True,
    )

    # Joindre avec les données originales
    df = df.merge(cart_values[["user_id", "cart_value_segment"]], on="user_id", how="left")

    return calculate_segment_kpis(df, "cart_value_segment")


def segment_by_engagement(df: pd.DataFrame) -> pd.DataFrame:
    """
    Segmente les données par niveau d'engagement.

    Les niveaux sont définis comme suit :
    - Faible : 1-3 jours actifs
    - Moyen : 4-9 jours actifs
    - Élevé : 10+ jours actifs

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame avec les KPIs par niveau d'engagement.
    """
    if df.empty:
        return pd.DataFrame()

    # Calculer l'engagement par utilisateur
    user_engagement = (
        df.groupby("user_id")
        .agg(
            active_days=("event_timestamp", lambda x: x.dt.date.nunique()),
            total_events=("event_id", "count"),
        )
        .reset_index()
    )

    # Créer les segments d'engagement
    user_engagement["engagement_level"] = pd.cut(
        user_engagement["active_days"],
        bins=[0, 3, 9, float("inf")],
        labels=["low", "medium", "high"],
        include_lowest=True,
    )

    # Joindre avec les données originales
    df = df.merge(
        user_engagement[["user_id", "engagement_level"]], on="user_id", how="left"
    )

    return calculate_segment_kpis(df, "engagement_level")


def calculate_cross_segment_analysis(
    df: pd.DataFrame, segment1: str, segment2: str
) -> pd.DataFrame:
    """
    Analyse croisée entre deux segments.

    Args:
        df: DataFrame contenant les données d'événements.
        segment1: Premier colonne de segmentation.
        segment2: Deuxième colonne de segmentation.

    Returns:
        DataFrame avec les KPIs pour chaque combinaison de segments.
    """
    if df.empty or segment1 not in df.columns or segment2 not in df.columns:
        return pd.DataFrame()

    results = []

    for (seg1_val, seg2_val), group in df.groupby([segment1, segment2]):
        row = {segment1: seg1_val, segment2: seg2_val}
        row["unique_users"] = group["user_id"].nunique()

        for event_type in ["view", "add_to_cart", "checkout", "purchase"]:
            row[f"{event_type}_users"] = group[group["event_type"] == event_type][
                "user_id"
            ].nunique()

        views = row.get("view_users", 0)
        purchase = row.get("purchase_users", 0)
        row["conversion_rate"] = (
            round((purchase / views * 100), 2) if views > 0 else 0.0
        )

        purchase_data = group[group["event_type"] == "purchase"]
        row["total_revenue"] = round(
            (purchase_data["price"] * purchase_data["quantity"]).sum(), 2
        )

        results.append(row)

    return pd.DataFrame(results)


def export_results(
    results: Dict[str, pd.DataFrame],
    output_prefix: str = "segmentation",
) -> None:
    """
    Exporte les résultats de segmentation en CSV.

    Args:
        results: Dictionnaire contenant les DataFrames de résultats.
        output_prefix: Préfixe pour les noms de fichiers.
    """
    for name, df in results.items():
        if not df.empty:
            output_path = f"{output_prefix}_{name}.csv"
            df.to_csv(output_path, index=False)
            logger.info(f"Résultats exportés vers {output_path}")


def run_full_analysis(
    data_source: str = "csv",
    file_path: str = "events.csv",
    mysql_config: Optional[Dict[str, Any]] = None,
    output_prefix: str = "segmentation",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> None:
    """
    Exécute l'analyse complète de segmentation.

    Args:
        data_source: Source des données ('csv' ou 'mysql').
        file_path: Chemin vers le fichier CSV (si data_source='csv').
        mysql_config: Configuration MySQL (si data_source='mysql').
        output_prefix: Préfixe pour les noms de fichiers de sortie.
        start_date: Date de début pour le filtrage.
        end_date: Date de fin pour le filtrage.
    """
    logger.info("Démarrage de l'analyse de segmentation...")

    # Charger les données
    if data_source == "mysql" and mysql_config:
        df = load_data_from_mysql(**mysql_config)
    else:
        df = load_data_from_csv(file_path)

    if df.empty:
        logger.error("Aucune donnée chargée. Arrêt de l'analyse.")
        return

    # Filtrer par date si nécessaire
    if start_date:
        df = df[df["event_timestamp"] >= start_date]
    if end_date:
        df = df[df["event_timestamp"] < end_date]

    logger.info(f"Données filtrées: {len(df)} événements.")

    # Exécuter toutes les segmentations
    results = {}

    # 1. Par device
    if "device_type" in df.columns:
        results["by_device"] = segment_by_device(df)
        logger.info("Segmentation par device terminée.")

    # 2. Par type d'utilisateur
    results["by_user_type"] = segment_by_user_type(df)
    logger.info("Segmentation par type d'utilisateur terminée.")

    # 3. Par source
    if "traffic_source" in df.columns:
        results["by_source"] = segment_by_source(df)
        logger.info("Segmentation par source terminée.")

    # 4. Par catégorie
    if "product_category" in df.columns:
        results["by_category"] = segment_by_category(df)
        logger.info("Segmentation par catégorie terminée.")

    # 5. Par valeur de panier
    results["by_cart_value"] = segment_by_cart_value(df)
    logger.info("Segmentation par valeur de panier terminée.")

    # 6. Par niveau d'engagement
    results["by_engagement"] = segment_by_engagement(df)
    logger.info("Segmentation par engagement terminée.")

    # 7. Analyse croisée device x source
    if "device_type" in df.columns and "traffic_source" in df.columns:
        results["cross_device_source"] = calculate_cross_segment_analysis(
            df, "device_type", "traffic_source"
        )
        logger.info("Analyse croisée device x source terminée.")

    # Exporter les résultats
    export_results(results, output_prefix)

    # Afficher un résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DE L'ANALYSE DE SEGMENTATION")
    print("=" * 60)
    for name, df_result in results.items():
        if not df_result.empty:
            print(f"\n--- {name} ---")
            print(df_result.to_string(index=False))
    print("=" * 60)

    logger.info("Analyse de segmentation terminée avec succès.")


if __name__ == "__main__":
    # Exemple d'utilisation
    run_full_analysis(
        data_source="csv",
        file_path="events.csv",
        output_prefix="segmentation",
    )
