"""
Module d'analyse A/B testing pour le projet Zoryn.

Ce module compare les résultats entre un groupe contrôle et un groupe variante,
calcule les différences absolues et relatives, vérifie la significativité
statistique, et exporte les résultats avec interprétation.
"""

import pandas as pd
import numpy as np
from typing import Optional, Dict, Any, Tuple
from scipy import stats
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_experiment_data(
    data_source: str = "csv",
    file_path: Optional[str] = None,
    mysql_config: Optional[Dict[str, Any]] = None,
    experiment_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> pd.DataFrame:
    """
    Charge les données de l'expérience A/B.

    Args:
        data_source: Source des données ('csv' ou 'mysql').
        file_path: Chemin vers le fichier CSV.
        mysql_config: Configuration MySQL.
        experiment_id: ID de l'expérience à filtrer.
        start_date: Date de début.
        end_date: Date de fin.

    Returns:
        DataFrame contenant les données de l'expérience.
    """
    df = pd.DataFrame()

    if data_source == "mysql" and mysql_config:
        try:
            import pymysql

            conn = pymysql.connect(**mysql_config)
            query = "SELECT * FROM experiment_assignments"
            conditions = []
            if experiment_id:
                conditions.append(f"experiment_id = '{experiment_id}'")
            if start_date:
                conditions.append(f"assigned_at >= '{start_date}'")
            if end_date:
                conditions.append(f"assigned_at < '{end_date}'")
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            df = pd.read_sql_query(query, conn)
            conn.close()
        except ImportError:
            logger.error("pymysql n'est pas installé.")
        except Exception as e:
            logger.error(f"Erreur MySQL: {e}")

    elif data_source == "csv" and file_path:
        try:
            df = pd.read_csv(file_path, parse_dates=["event_timestamp"])
        except FileNotFoundError:
            logger.error(f"Fichier non trouvé: {file_path}")
        except Exception as e:
            logger.error(f"Erreur CSV: {e}")

    if not df.empty:
        logger.info(f"Chargé {len(df)} lignes de données d'expérience.")
    return df


def calculate_conversion_rates(
    df: pd.DataFrame,
    group_column: str = "group",
    event_column: str = "event_type",
    conversion_event: str = "purchase",
) -> Dict[str, Any]:
    """
    Calcule les taux de conversion pour chaque groupe.

    Args:
        df: DataFrame contenant les données.
        group_column: Nom de la colonne de groupe (control/variant).
        event_column: Nom de la colonne d'événement.
        conversion_event: Événement de conversion à mesurer.

    Returns:
        Dictionnaire avec les métriques par groupe.
    """
    if df.empty:
        return {}

    results = {}

    for group_name in df[group_column].unique():
        group_data = df[df[group_column] == group_name]

        # Nombre total d'utilisateurs dans le groupe
        total_users = group_data["user_id"].nunique()

        # Nombre d'utilisateurs convertis
        converted_users = group_data[group_data[event_column] == conversion_event][
            "user_id"
        ].nunique()

        # Taux de conversion
        conversion_rate = (
            (converted_users / total_users * 100) if total_users > 0 else 0.0
        )

        # Revenu total
        purchase_data = group_data[group_data[event_column] == conversion_event]
        total_revenue = (purchase_data["price"] * purchase_data["quantity"]).sum()

        # Revenu moyen par utilisateur
        avg_revenue_per_user = (
            (total_revenue / total_users) if total_users > 0 else 0.0
        )

        # Panier moyen
        avg_order_value = (
            purchase_data.groupby("order_id")
            .apply(lambda x: (x["price"] * x["quantity"]).sum())
            .mean()
            if not purchase_data.empty
            else 0.0
        )

        results[group_name] = {
            "total_users": total_users,
            "converted_users": converted_users,
            "conversion_rate": round(conversion_rate, 2),
            "total_revenue": round(total_revenue, 2),
            "avg_revenue_per_user": round(avg_revenue_per_user, 2),
            "avg_order_value": round(avg_order_value, 2) if not np.isnan(avg_order_value) else 0.0,
        }

    return results


def calculate_differences(control_metrics: Dict, variant_metrics: Dict) -> Dict[str, Any]:
    """
    Calcule les différences absolues et relatives entre contrôle et variante.

    Args:
        control_metrics: Métriques du groupe contrôle.
        variant_metrics: Métriques du groupe variante.

    Returns:
        Dictionnaire avec les différences calculées.
    """
    differences = {}

    # Taux de conversion
    control_cr = control_metrics.get("conversion_rate", 0)
    variant_cr = variant_metrics.get("conversion_rate", 0)
    absolute_diff_cr = variant_cr - control_cr
    relative_diff_cr = (
        (absolute_diff_cr / control_cr * 100) if control_cr > 0 else 0.0
    )

    differences["conversion_rate"] = {
        "control": control_cr,
        "variant": variant_cr,
        "absolute_difference": round(absolute_diff_cr, 2),
        "relative_difference_pct": round(relative_diff_cr, 2),
    }

    # Revenu moyen par utilisateur
    control_rpu = control_metrics.get("avg_revenue_per_user", 0)
    variant_rpu = variant_metrics.get("avg_revenue_per_user", 0)
    absolute_diff_rpu = variant_rpu - control_rpu
    relative_diff_rpu = (
        (absolute_diff_rpu / control_rpu * 100) if control_rpu > 0 else 0.0
    )

    differences["avg_revenue_per_user"] = {
        "control": control_rpu,
        "variant": variant_rpu,
        "absolute_difference": round(absolute_diff_rpu, 2),
        "relative_difference_pct": round(relative_diff_rpu, 2),
    }

    # Panier moyen
    control_aov = control_metrics.get("avg_order_value", 0)
    variant_aov = variant_metrics.get("avg_order_value", 0)
    absolute_diff_aov = variant_aov - control_aov
    relative_diff_aov = (
        (absolute_diff_aov / control_aov * 100) if control_aov > 0 else 0.0
    )

    differences["avg_order_value"] = {
        "control": control_aov,
        "variant": variant_aov,
        "absolute_difference": round(absolute_diff_aov, 2),
        "relative_difference_pct": round(relative_diff_aov, 2),
    }

    return differences


def check_statistical_significance(
    df: pd.DataFrame,
    group_column: str = "group",
    event_column: str = "event_type",
    conversion_event: str = "purchase",
    significance_level: float = 0.05,
) -> Dict[str, Any]:
    """
    Vérifie la significativité statistique de la différence de conversion.

    Utilise le test du chi-deux (Chi-squared test) pour comparer
    les taux de conversion entre contrôle et variante.

    Args:
        df: DataFrame contenant les données.
        group_column: Nom de la colonne de groupe.
        event_column: Nom de la colonne d'événement.
        conversion_event: Événement de conversion.
        significance_level: Niveau de significativité (défaut: 0.05).

    Returns:
        Dictionnaire avec les résultats du test statistique.
    """
    if df.empty:
        return {}

    # Créer la table de contingence
    control_data = df[df[group_column] == "control"]
    variant_data = df[df[group_column] == "variant"]

    control_total = control_data["user_id"].nunique()
    variant_total = variant_data["user_id"].nunique()

    control_converted = control_data[control_data[event_column] == conversion_event][
        "user_id"
    ].nunique()
    variant_converted = variant_data[variant_data[event_column] == conversion_event][
        "user_id"
    ].nunique()

    control_not_converted = control_total - control_converted
    variant_not_converted = variant_total - variant_converted

    # Table de contingence
    contingency_table = np.array(
        [[control_converted, control_not_converted],
         [variant_converted, variant_not_converted]]
    )

    # Test du chi-deux
    try:
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)

        # Interprétation
        is_significant = p_value < significance_level

        if is_significant:
            if variant_converted / variant_total > control_converted / control_total:
                interpretation = "La variante est significativement MEILLEURE que le contrôle."
            else:
                interpretation = "La variante est significativement INFÉRIEURE au contrôle."
        else:
            interpretation = "La différence n'est pas statistiquement significative."

        return {
            "chi2_statistic": round(chi2, 4),
            "p_value": round(p_value, 6),
            "degrees_of_freedom": dof,
            "significance_level": significance_level,
            "is_significant": is_significant,
            "interpretation": interpretation,
            "control_conversion_rate": round(control_converted / control_total * 100, 2) if control_total > 0 else 0,
            "variant_conversion_rate": round(variant_converted / variant_total * 100, 2) if variant_total > 0 else 0,
        }

    except Exception as e:
        logger.error(f"Erreur lors du test statistique: {e}")
        return {"error": str(e)}


def calculate_confidence_interval(
    df: pd.DataFrame,
    group_column: str = "group",
    event_column: str = "event_type",
    conversion_event: str = "purchase",
    confidence_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Calcule l'intervalle de confiance pour la différence de taux de conversion.

    Args:
        df: DataFrame contenant les données.
        group_column: Nom de la colonne de groupe.
        event_column: Nom de la colonne d'événement.
        conversion_event: Événement de conversion.
        confidence_level: Niveau de confiance (défaut: 0.95).

    Returns:
        Dictionnaire avec l'intervalle de confiance.
    """
    control_data = df[df[group_column] == "control"]
    variant_data = df[df[group_column] == "variant"]

    n_control = control_data["user_id"].nunique()
    n_variant = variant_data["user_id"].nunique()

    p_control = (
        control_data[control_data[event_column] == conversion_event]["user_id"].nunique()
        / n_control
        if n_control > 0
        else 0
    )
    p_variant = (
        variant_data[variant_data[event_column] == conversion_event]["user_id"].nunique()
        / n_variant
        if n_variant > 0
        else 0
    )

    # Erreur standard de la différence
    se_diff = np.sqrt(
        (p_control * (1 - p_control) / n_control)
        + (p_variant * (1 - p_variant) / n_variant)
    )

    # Z-score pour le niveau de confiance
    z_score = stats.norm.ppf(1 - (1 - confidence_level) / 2)

    # Différence et intervalle
    diff = p_variant - p_control
    margin_of_error = z_score * se_diff

    ci_lower = diff - margin_of_error
    ci_upper = diff + margin_of_error

    return {
        "difference": round(diff * 100, 2),
        "ci_lower": round(ci_lower * 100, 2),
        "ci_upper": round(ci_upper * 100, 2),
        "confidence_level": confidence_level,
        "margin_of_error": round(margin_of_error * 100, 2),
    }


def generate_interpretation(
    differences: Dict[str, Any],
    significance: Dict[str, Any],
    confidence_interval: Dict[str, Any],
) -> str:
    """
    Génère une interprétation textuelle des résultats.

    Args:
        differences: Différences calculées entre groupes.
        significance: Résultats du test de significativité.
        confidence_interval: Intervalle de confiance.

    Returns:
        Texte d'interprétation.
    """
    lines = []
    lines.append("=" * 60)
    lines.append("INTERPRÉTATION DES RÉSULTATS A/B TEST")
    lines.append("=" * 60)

    # Taux de conversion
    cr = differences.get("conversion_rate", {})
    lines.append(f"\nTaux de conversion:")
    lines.append(f"  Contrôle: {cr.get('control', 0)}%")
    lines.append(f"  Variante: {cr.get('variant', 0)}%")
    lines.append(f"  Différence absolue: {cr.get('absolute_difference', 0)} points")
    lines.append(f"  Différence relative: {cr.get('relative_difference_pct', 0)}%")

    # Revenu
    rpu = differences.get("avg_revenue_per_user", {})
    lines.append(f"\nRevenu moyen par utilisateur:")
    lines.append(f"  Contrôle: {rpu.get('control', 0)}€")
    lines.append(f"  Variante: {rpu.get('variant', 0)}€")
    lines.append(f"  Différence: {rpu.get('absolute_difference', 0)}€")

    # Significativité
    if "error" not in significance:
        lines.append(f"\nTest de significativité (Chi²):")
        lines.append(f"  p-value: {significance.get('p_value', 'N/A')}")
        lines.append(f"  Significatif: {'Oui' if significance.get('is_significant') else 'Non'}")
        lines.append(f"  Interprétation: {significance.get('interpretation', 'N/A')}")

    # Intervalle de confiance
    lines.append(f"\nIntervalle de confiance ({confidence_interval.get('confidence_level', 0.95)*100}%):")
    lines.append(f"  Différence: {confidence_interval.get('difference', 0)}%")
    lines.append(f"  IC: [{confidence_interval.get('ci_lower', 0)}%, {confidence_interval.get('ci_upper', 0)}%]")

    # Recommandation finale
    lines.append(f"\n" + "-" * 60)
    if significance.get("is_significant"):
        if cr.get("absolute_difference", 0) > 0:
            lines.append("RECOMMANDATION: Déployer la variante (meilleure performance)")
        else:
            lines.append("RECOMMANDATION: Maintenir le contrôle (variante inférieure)")
    else:
        lines.append("RECOMMANDATION: Continuer l'expérimentation ou augmenter l'échantillon")
    lines.append("-" * 60)

    return "\n".join(lines)


def export_results(
    differences: Dict[str, Any],
    significance: Dict[str, Any],
    confidence_interval: Dict[str, Any],
    interpretation: str,
    output_path: str = "ab_test_results.csv",
) -> None:
    """
    Exporte les résultats de l'analyse A/B en CSV.

    Args:
        differences: Différences calculées.
        significance: Résultats du test de significativité.
        confidence_interval: Intervalle de confiance.
        interpretation: Texte d'interprétation.
        output_path: Chemin de sortie.
    """
    # Créer un DataFrame avec tous les résultats
    rows = []

    # Métriques de conversion
    for metric_name, metric_data in differences.items():
        rows.append({
            "metric": metric_name,
            "control_value": metric_data.get("control"),
            "variant_value": metric_data.get("variant"),
            "absolute_difference": metric_data.get("absolute_difference"),
            "relative_difference_pct": metric_data.get("relative_difference_pct"),
        })

    # Résultats statistiques
    if "error" not in significance:
        rows.append({
            "metric": "statistical_significance",
            "control_value": significance.get("control_conversion_rate"),
            "variant_value": significance.get("variant_conversion_rate"),
            "absolute_difference": significance.get("chi2_statistic"),
            "relative_difference_pct": significance.get("p_value"),
        })

    # Intervalle de confiance
    rows.append({
        "metric": "confidence_interval",
        "control_value": None,
        "variant_value": None,
        "absolute_difference": confidence_interval.get("ci_lower"),
        "relative_difference_pct": confidence_interval.get("ci_upper"),
    })

    df_results = pd.DataFrame(rows)
    df_results.to_csv(output_path, index=False)
    logger.info(f"Résultats exportés vers {output_path}")

    # Exporter l'interprétation
    interpretation_path = output_path.replace(".csv", "_interpretation.txt")
    with open(interpretation_path, "w", encoding="utf-8") as f:
        f.write(interpretation)
    logger.info(f"Interprétation exportée vers {interpretation_path}")


def run_full_analysis(
    data_source: str = "csv",
    file_path: Optional[str] = "ab_test_data.csv",
    mysql_config: Optional[Dict[str, Any]] = None,
    experiment_id: Optional[str] = None,
    output_path: str = "ab_test_results.csv",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    significance_level: float = 0.05,
) -> None:
    """
    Exécute l'analyse A/B complète.

    Args:
        data_source: Source des données ('csv' ou 'mysql').
        file_path: Chemin vers le fichier CSV.
        mysql_config: Configuration MySQL.
        experiment_id: ID de l'expérience.
        output_path: Chemin de sortie.
        start_date: Date de début.
        end_date: Date de fin.
        significance_level: Niveau de significativité.
    """
    logger.info("Démarrage de l'analyse A/B...")

    # Charger les données
    df = load_experiment_data(
        data_source=data_source,
        file_path=file_path,
        mysql_config=mysql_config,
        experiment_id=experiment_id,
        start_date=start_date,
        end_date=end_date,
    )

    if df.empty:
        logger.error("Aucune donnée chargée. Arrêt de l'analyse.")
        return

    logger.info(f"Données chargées: {len(df)} événements.")

    # Vérifier les colonnes requises
    required_columns = ["user_id", "group", "event_type"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        logger.error(f"Colonnes manquantes: {missing_columns}")
        return

    # 1. Calculer les taux de conversion par groupe
    metrics = calculate_conversion_rates(df)
    if not metrics or len(metrics) < 2:
        logger.error("Impossible de calculer les métriques pour les deux groupes.")
        return

    control_metrics = metrics.get("control", {})
    variant_metrics = metrics.get("variant", {})

    logger.info(f"Contrôle - Taux de conversion: {control_metrics.get('conversion_rate', 0)}%")
    logger.info(f"Variante - Taux de conversion: {variant_metrics.get('conversion_rate', 0)}%")

    # 2. Calculer les différences
    differences = calculate_differences(control_metrics, variant_metrics)

    # 3. Test de significativité
    significance = check_statistical_significance(
        df, significance_level=significance_level
    )

    # 4. Intervalle de confiance
    confidence_interval = calculate_confidence_interval(df)

    # 5. Générer l'interprétation
    interpretation = generate_interpretation(differences, significance, confidence_interval)

    # 6. Exporter les résultats
    export_results(differences, significance, confidence_interval, interpretation, output_path)

    # Afficher l'interprétation
    print(interpretation)

    logger.info("Analyse A/B terminée avec succès.")


if __name__ == "__main__":
    # Exemple d'utilisation
    run_full_analysis(
        data_source="csv",
        file_path="ab_test_data.csv",
        output_path="ab_test_results.csv",
    )
