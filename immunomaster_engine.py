"""
================================================================================
IMMUNOMASTER / OPEN-IMMUNOQUERY VALIDATION ENGINE (PYTHON 3.13)
High-precision mathematical implementation of:
1. Shannon Information Gain & Pairwise Separation (Forward Dilemma Solver)
2. Submodular Greedy ILP Panel Selection
3. Multi-Class Bayesian Classifier with Beta Smoothing (Inverse Profiler)
================================================================================
"""

import math
from typing import Dict, List, Tuple, Any

class ImmunoMasterEnginePy:
    def __init__(self, laplace_alpha: float = 1.0, laplace_beta: float = 1.0, default_unreported: float = 0.05):
        self.laplace_alpha = laplace_alpha
        self.laplace_beta = laplace_beta
        self.default_unreported = default_unreported
        self.antibodies: Dict[str, dict] = {}
        self.neoplasms: Dict[str, dict] = {}
        self.evidence: Dict[Tuple[str, str], dict] = {}

    def add_antibody(self, ab_id: str, code: str, name: str, target: str, local_stock: bool = True):
        self.antibodies[ab_id] = {
            "id": ab_id,
            "code": code,
            "name": name,
            "target": target,
            "local_stock": local_stock
        }

    def add_neoplasm(self, neo_id: str, icd: str, name: str, organ: str, category: str):
        self.neoplasms[neo_id] = {
            "id": neo_id,
            "icd": icd,
            "name": name,
            "organ": organ,
            "category": category
        }

    def add_evidence(self, neo_id: str, ab_id: str, pos: int, total: int, citation: str = ""):
        pct = (pos / total * 100.0) if total > 0 else 0.0
        self.evidence[(neo_id, ab_id)] = {
            "pos": pos,
            "total": total,
            "pct": round(pct, 1),
            "citation": citation
        }

    def get_smoothed_reactivity(self, neo_id: str, ab_id: str) -> float:
        ev = self.evidence.get((neo_id, ab_id))
        if not ev or ev["total"] == 0:
            return self.default_unreported
        return (ev["pos"] + self.laplace_alpha) / (ev["total"] + self.laplace_alpha + self.laplace_beta)

    # 1. FORWARD DILEMMA SOLVER
    def solve_forward_panel(self, candidate_ids: List[str], max_panel_size: int = 4, require_local: bool = False) -> dict:
        k = len(candidate_ids)
        if k < 2:
            raise ValueError("Dilemma requires at least 2 candidate neoplasms.")

        prior = 1.0 / k
        base_entropy = -math.log2(prior)

        scored = []
        for ab_id, ab in self.antibodies.items():
            if require_local and not ab["local_stock"]:
                continue

            probs = [self.get_smoothed_reactivity(nid, ab_id) for nid in candidate_ids]
            p_pos = sum(p * prior for p in probs)
            p_neg = 1.0 - p_pos

            entropy_pos = 0.0
            if p_pos > 1e-6:
                for p in probs:
                    post = (p * prior) / p_pos
                    if post > 1e-6:
                        entropy_pos -= post * math.log2(post)

            entropy_neg = 0.0
            if p_neg > 1e-6:
                for p in probs:
                    post = ((1.0 - p) * prior) / p_neg
                    if post > 1e-6:
                        entropy_neg -= post * math.log2(post)

            cond_entropy = (p_pos * entropy_pos) + (p_neg * entropy_neg)
            ig = max(0.0, base_entropy - cond_entropy)

            # Pairwise distance
            pair_dists = []
            for i in range(k):
                for j in range(i + 1, k):
                    pair_dists.append(abs(probs[i] - probs[j]))
            mean_dist = sum(pair_dists) / len(pair_dists) if pair_dists else 0.0

            composite_score = min(100, round((0.6 * (ig / base_entropy) + 0.4 * mean_dist) * 100))

            scored.append({
                "antibody": ab,
                "information_gain": round(ig, 4),
                "mean_separation": round(mean_dist, 4),
                "power_score": composite_score,
                "probabilities": probs
            })

        scored.sort(key=lambda x: x["power_score"], reverse=True)

        # Greedy Submodular Panel Selection
        num_pairs = (k * (k - 1)) // 2
        pair_sep = [0.0] * num_pairs

        def pair_idx(i, j):
            cnt = sum(k - 1 - r for r in range(i))
            return cnt + (j - i - 1)

        selected = []
        pool = list(scored)

        while len(selected) < max_panel_size and pool:
            best_idx = -1
            best_gain = -1.0

            for idx, cand in enumerate(pool):
                marginal = 0.0
                for i in range(k):
                    for j in range(i + 1, k):
                        pidx = pair_idx(i, j)
                        diff = abs(cand["probabilities"][i] - cand["probabilities"][j])
                        marginal += diff * math.exp(-1.5 * pair_sep[pidx])
                if marginal > best_gain:
                    best_gain = marginal
                    best_idx = idx

            if best_idx >= 0 and best_gain > 0.05:
                chosen = pool.pop(best_idx)
                selected.append(chosen)
                for i in range(k):
                    for j in range(i + 1, k):
                        pidx = pair_idx(i, j)
                        diff = abs(chosen["probabilities"][i] - chosen["probabilities"][j])
                        pair_sep[pidx] += diff
            else:
                if pool and len(selected) < max_panel_size:
                    selected.append(pool.pop(0))
                else:
                    break

        return {
            "base_entropy": round(base_entropy, 3),
            "candidates": [self.neoplasms[nid] for nid in candidate_ids],
            "optimal_panel": selected,
            "all_ranked": scored
        }

    # 2. INVERSE PROFILER
    def solve_inverse_profile(self, staining: Dict[str, str], top_n: int = 5) -> dict:
        active = {ab_id: st for ab_id, st in staining.items() if st in ("+", "-") and ab_id in self.antibodies}
        if not active:
            raise ValueError("Staining pattern must contain at least one valid marker (+/-).")

        num_neo = len(self.neoplasms)
        prior_log = -math.log(num_neo)

        candidates = []
        for nid, neo in self.neoplasms.items():
            log_lik = 0.0
            concordant = 0
            breakdown = []

            for ab_id, status in active.items():
                p_react = self.get_smoothed_reactivity(nid, ab_id)
                if status == "+":
                    p_stain = max(p_react, 0.001)
                    is_conc = (p_react >= 0.5)
                else:
                    p_stain = max(1.0 - p_react, 0.001)
                    is_conc = (p_react < 0.5)

                log_lik += math.log(p_stain)
                if is_conc:
                    concordant += 1

                breakdown.append({
                    "antibody": self.antibodies[ab_id]["code"],
                    "observed": status,
                    "expected_pct": round(p_react * 100),
                    "is_concordant": is_conc
                })

            log_post = prior_log + log_lik
            candidates.append({
                "neoplasm": neo,
                "log_post": log_post,
                "concordant": concordant,
                "total": len(active),
                "concordance_rate": round(concordant / len(active) * 100, 1),
                "breakdown": breakdown
            })

        # Softmax Log-Sum-Exp
        max_log = max(c["log_post"] for c in candidates)
        sum_exp = sum(math.exp(c["log_post"] - max_log) for c in candidates)

        for c in candidates:
            c["posterior_pct"] = round((math.exp(c["log_post"] - max_log) / sum_exp) * 100, 2)

        candidates.sort(key=lambda x: x["log_post"], reverse=True)

        return {
            "tested": active,
            "top_candidates": candidates[:top_n]
        }

if __name__ == "__main__":
    engine = ImmunoMasterEnginePy()
    # Test dataset
    markers = [
        ("ck7", "CK7", "Cytokeratin 7", "Cytoplasmic", True),
        ("ck20", "CK20", "Cytokeratin 20", "Cytoplasmic", True),
        ("ttf1", "TTF-1", "Thyroid Transcription Factor-1", "Nuclear", True),
        ("p40", "p40", "p40 (Delta Np63)", "Nuclear", True),
        ("gata3", "GATA3", "GATA3", "Nuclear", True),
        ("cdx2", "CDX2", "CDX2", "Nuclear", True),
        ("calretinin", "Calretinin", "Calretinin", "Nuclear/Cyto", True),
        ("wt1", "WT1", "WT1", "Nuclear", True)
    ]
    for ab in markers:
        engine.add_antibody(*ab)

    tumors = [
        ("lung_adeno", "8140/3", "Adenocarcinoma Pulmonar", "Pulmón", "Epitelial"),
        ("lung_squam", "8070/3", "Carcinoma Escamoso Pulmón", "Pulmón", "Epitelial"),
        ("mesothelioma", "9052/3", "Mesotelioma Maligno", "Pleura", "Mesotelial"),
        ("breast_ca", "8500/3", "Carcinoma Ductal Mama", "Mama", "Epitelial"),
        ("colon_adeno", "8140/3", "Adenocarcinoma Colorrectal", "Colon", "Epitelial")
    ]
    for t in tumors:
        engine.add_neoplasm(*t)

    # Evidence
    ev_data = [
        ("lung_adeno", "ck7", 1950, 2000), ("lung_adeno", "ck20", 120, 2000), ("lung_adeno", "ttf1", 1720, 2000), ("lung_adeno", "p40", 20, 1800),
        ("lung_squam", "ck7", 350, 1800), ("lung_squam", "ck20", 40, 1800), ("lung_squam", "ttf1", 30, 1800), ("lung_squam", "p40", 1780, 1800),
        ("mesothelioma", "ck7", 1900, 2000), ("mesothelioma", "ck20", 50, 2000), ("mesothelioma", "calretinin", 1940, 2000), ("mesothelioma", "wt1", 1820, 2000), ("mesothelioma", "ttf1", 15, 2000),
        ("colon_adeno", "ck7", 150, 2000), ("colon_adeno", "ck20", 1950, 2000), ("colon_adeno", "cdx2", 1980, 2000),
        ("breast_ca", "ck7", 1900, 2000), ("breast_ca", "gata3", 1850, 2000), ("breast_ca", "ttf1", 10, 2000)
    ]
    for ev in ev_data:
        engine.add_evidence(*ev)

    print(">>> 1. PROBANDO FORWARD SOLVER (Dilema: Pulmón Adeno vs Pulmón Escamoso vs Mesotelioma):")
    fwd = engine.solve_forward_panel(["lung_adeno", "lung_squam", "mesothelioma"], max_panel_size=4)
    for p in fwd["optimal_panel"]:
        print(f"   [Seleccionado] {p['antibody']['code']}: Poder Discriminatorio = {p['power_score']}%, IG = {p['information_gain']}")

    print("\n>>> 2. PROBANDO INVERSE CLASSIFIER (Perfil: CK7+, CK20-, TTF1+, p40-):")
    inv = engine.solve_inverse_profile({"ck7": "+", "ck20": "-", "ttf1": "+", "p40": "-"})
    for cand in inv["top_candidates"]:
        print(f"   Neoplasia: {cand['neoplasm']['name']:<30} Prob. Bayesiana: {cand['posterior_pct']:>6.2f}% | Concordancia: {cand['concordance_rate']}%")
