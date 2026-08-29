"""
Module d'analyse de tunnel de conversion pour le projet Zoryn.

Ce module calcule les étapes du tunnel (view -> cart -> checkout -> purchase),
les taux de conversion entre chaque étape, et exporte les résultats en CSV.
"""

import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
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
        query: Requête SQL personnalisée. Si None, utilise la table analytics_events.
        table: Nom de la table à charger si pas de requête personnalisée.
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
                conditions.append(f"occurred_at >= '{start_date}'")
            if end_date:
                conditions.append(f"occurred_at < '{end_date}'")
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


def calculate_funnel(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calcule les étapes du tunnel de conversion.

    Args:
        df: DataFrame contenant les colonnes 'user_id' et 'event_type'.

    Returns:
        Dictionnaire avec les compteurs par étape et les taux de conversion.
    """
    if df.empty:
        logger.warning("DataFrame vide, impossible de calculer le tunnel.")
        return {}

    # Filtrer les types d'événements valides
    valid_events = ["view", "add_to_cart", "checkout", "purchase"]
    df_filtered = df[df["event_type"].isin(valid_events)].copy()

    if df_filtered.empty:
        logger.warning("Aucun événement valide trouvé dans les données.")
        return {}

    # Compter les utilisateurs uniques par étape
    funnel_steps = {}
    for event in valid_events:
        funnel_steps[event] = df_filtered[df_filtered["event_type"] == event][
            "user_id"
        ].nunique()

    # Calculer les taux de conversion
    conversion_rates = {}
    step_pairs = [
        ("view", "add_to_cart"),
        ("add_to_cart", "checkout"),
        ("checkout", "purchase"),
    ]

    for from_step, to_step in step_pairs:
        from_count = funnel_steps[from_step]
        to_count = funnel_steps[to_step]
        if from_count > 0:
            conversion_rates[f"{from_step}_to_{to_step}"] = round(
                (to_count / from_count) * 100, 2
            )
        else:
            conversion_rates[f"{from_step}_to_{to_step}"] = 0.0

    # Taux de conversion global
    total_views = funnel_steps.get("view", 0)
    total_purchases = funnel_steps.get("purchase", 0)
    if total_views > 0:
        conversion_rates["overall"] = round((total_purchases / total_views) * 100, 2)
    else:
        conversion_rates["overall"] = 0.0

    result = {"funnel_steps": funnel_steps, "conversion_rates": conversion_rates}
    logger.info("Tunnel de conversion calculé avec succès.")
    return result


def calculate_funnel_by_period(
    df: pd.DataFrame, period: str = "daily"
) -> pd.DataFrame:
    """
    Calcule le tunnel de conversion par période.

    Args:
        df: DataFrame contenant les colonnes 'user_id', 'event_type', 'event_timestamp'.
        period: Granularité temporelle ('daily', 'weekly', 'monthly').

    Returns:
        DataFrame avec les métriques du tunnel par période.
    """
    if df.empty:
        return pd.DataFrame()

    # Déterminer la colonne de regroupement temporel
    freq_map = {"daily": "D", "weekly": "W", "monthly": "MS"}
    freq = freq_map.get(period, "D")

    df = df.copy()
    df["period"] = df["event_timestamp"].dt.to_period(freq)

    valid_events = ["view", "add_to_cart", "checkout", "purchase"]
    results = []

    for period_val, group in df.groupby("period"):
        row = {"period": str(period_val)}
        for event in valid_events:
            row[f"{event}_users"] = group[group["event_type"] == event][
                "user_id"
            ].nunique()

        # Calculer les taux de conversion
        views = row.get("view_users", 0)
        cart = row.get("add_to_cart_users", 0)
        checkout = row.get("checkout_users", 0)
        purchase = row.get("purchase_users", 0)

        row["view_to_cart_pct"] = round((cart / views * 100), 2) if views > 0 else 0.0
        row["cart_to_checkout_pct"] = (
            round((checkout / cart * 100), 2) if cart > 0 else 0.0
        )
        row["checkout_to_purchase_pct"] = (
            round((purchase / checkout * 100), 2) if checkout > 0 else 0.0
        )
        row["overall_conversion_pct"] = (
            round((purchase / views * 100), 2) if views > 0 else 0.0
        )

        results.append(row)

    return pd.DataFrame(results)


def calculate_funnel_by_segment(
    df: pd.DataFrame, segment_column: str
) -> pd.DataFrame:
    """
    Calcule le tunnel de conversion par segment (device, category, source, etc.).

    Args:
        df: DataFrame contenant les données d'événements.
        segment_column: Nom de la colonne de segmentation.

    Returns:
        DataFrame avec les métriques du tunnel par segment.
    """
    if df.empty or segment_column not in df.columns:
        return pd.DataFrame()

    valid_events = ["view", "add_to_cart", "checkout", "purchase"]
    results = []

    for segment_val, group in df.groupby(segment_column):
        row = {segment_column: segment_val}
        for event in valid_events:
            row[f"{event}_users"] = group[group["event_type"] == event][
                "user_id"
            ].nunique()

        views = row.get("view_users", 0)
        cart = row.get("add_to_cart_users", 0)
        checkout = row.get("checkout_users", 0)
        purchase = row.get("purchase_users", 0)

        row["view_to_cart_pct"] = round((cart / views * 100), 2) if views > 0 else 0.0
        row["cart_to_checkout_pct"] = (
            round((checkout / cart * 100), 2) if cart > 0 else 0.0
        )
        row["checkout_to_purchase_pct"] = (
            round((purchase / checkout * 100), 2) if checkout > 0 else 0.0
        )
        row["overall_conversion_pct"] = (
            round((purchase / views * 100), 2) if views > 0 else 0.0
        )

        results.append(row)

    return pd.DataFrame(results)


def identify_abandoned_carts(df: pd.DataFrame) -> pd.DataFrame:
    """
    Identifie les utilisateurs qui ont ajouté au panier mais pas acheté.

    Args:
        df: DataFrame contenant les données d'événements.

    Returns:
        DataFrame des paniers abandonnés.
    """
    if df.empty:
        return pd.DataFrame()

    # Utilisateurs avec ajout au panier
    cart_users = set(
        df[df["event_type"] == "add_to_cart"]["user_id"].unique()
    )

    # Utilisateurs avec achat
    purchase_users = set(
        df[df["event_type"] == "purchase"]["user_id"].unique()
    )

    # Différence : paniers abandonnés
    abandoned_users = cart_users - purchase_users

    if not abandoned_users:
        logger.info("Aucun panier abandonné trouvé.")
        return pd.DataFrame()

    abandoned_df = df[
        (df["user_id"].isin(abandoned_users))
        & (df["event_type"] == "add_to_cart")
    ].copy()

    # Agréger par utilisateur
    result = (
        abandoned_df.groupby("user_id")
        .agg(
            cart_count=("event_id", "count"),
            first_cart_date=("event_timestamp", "min"),
            last_cart_date=("event_timestamp", "max"),
        )
        .reset_index()
    )

    result["days_since_last_cart"] = (
        pd.Timestamp.now() - result["last_cart_date"]
    ).dt.days

    logger.info(f"Trouvé {len(result)} paniers abandonnés.")
    return result


def export_results(
    funnel_result: Dict[str, Any],
    output_path: str = "funnel_analysis_results.csv",
    period_data: Optional[pd.DataFrame] = None,
    segment_data: Optional[pd.DataFrame] = None,
    abandoned_data: Optional[pd.DataFrame] = None,
) -> None:
    """
    Exporte les résultats de l'analyse en CSV.

    Args:
        funnel_result: Résultat du calcul du tunnel.
        output_path: Chemin de sortie pour le fichier CSV principal.
        period_data: Données par période (optionnel).
        segment_data: Données par segment (optionnel).
        abandoned_data: Données de paniers abandonnés (optionnel).
    """
    # Exporter les résultats principaux
    if funnel_result:
        summary_df = pd.DataFrame(
            [
                {
                    "metric": "view_users",
                    "value": funnel_result["funnel_steps"].get("view", 0),
                },
                {
                    "metric": "add_to_cart_users",
                    "value": funnel_result["funnel_steps"].get("add_to_cart", 0),
                },
                {
                    "metric": "checkout_users",
                    "value": funnel_result["funnel_steps"].get("checkout", 0),
                },
                {
                    "metric": "purchase_users",
                    "value": funnel_result["funnel_steps"].get("purchase", 0),
                },
            ]
        )
        summary_df.to_csv(output_path, index=False)
        logger.info(f"Résumé exporté vers {output_path}")

    # Exporter les données par période
    if period_data is not None and not period_data.empty:
        period_path = output_path.replace(".csv", "_by_period.csv")
        period_data.to_csv(period_path, index=False)
        logger.info(f"Données par période exportées vers {period_path}")

    # Exporter les données par segment
    if segment_data is not None and not segment_data.empty:
        segment_path = output_path.replace(".csv", "_by_segment.csv")
        segment_data.to_csv(segment_path, index=False)
        logger.info(f"Données par segment exportées vers {segment_path}")

    # Exporter les paniers abandonnés
    if abandoned_data is not None and not abandoned_data.empty:
        abandoned_path = output_path.replace(".csv", "_abandoned_carts.csv")
        abandoned_data.to_csv(abandoned_path, index=False)
        logger.info(f"Paniers abandonnés exportés vers {abandoned_path}")


def run_full_analysis(
    data_source: str = "csv",
    file_path: str = "events.csv",
    mysql_config: Optional[Dict[str, Any]] = None,
    output_path: str = "funnel_analysis_results.csv",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> None:
    """
    Exécute l'analyse complète du tunnel de conversion.

    Args:
        data_source: Source des données ('csv' ou 'mysql').
        file_path: Chemin vers le fichier CSV (si data_source='csv').
        mysql_config: Configuration MySQL (si data_source='mysql').
        output_path: Chemin de sortie pour les résultats.
        start_date: Date de début pour le filtrage.
        end_date: Date de fin pour le filtrage.
    """
    logger.info("Démarrage de l'analyse du tunnel de conversion...")

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

    # Calculer le tunnel global
    funnel_result = calculate_funnel(df)

    # Calculer le tunnel par période
    period_data = calculate_funnel_by_period(df)

    # Calculer le tunnel par device
    segment_data = None
    if "device_type" in df.columns:
        segment_data = calculate_funnel_by_segment(df, "device_type")

    # Identifier les paniers abandonnés
    abandoned_data = identify_abandoned_carts(df)

    # Exporter les résultats
    export_results(
        funnel_result=funnel_result,
        output_path=output_path,
        period_data=period_data,
        segment_data=segment_data,
        abandoned_data=abandoned_data,
    )

    # Afficher le résumé
    if funnel_result:
        print("\n" + "=" * 50)
        print("RÉSUMÉ DU TUNNEL DE CONVERSION")
        print("=" * 50)
        for step, count in funnel_result["funnel_steps"].items():
            print(f"  {step}: {count} utilisateurs")
        print("\nTaux de conversion:")
        for rate_name, rate_value in funnel_result["conversion_rates"].items():
            print(f"  {rate_name}: {rate_value}%")
        print("=" * 50)

    logger.info("Analyse du tunnel terminée avec succès.")


if __name__ == "__main__":
    # Exemple d'utilisation
    run_full_analysis(
        data_source="csv",
        file_path="events.csv",
        output_path="funnel_analysis_results.csv",
    )
