# Re:Learn Misconception Dataset — Documentation

## 1. Purpose and scope

This dataset implements the requested diagnostic-tutor design for introductory algebra. The core dataset contains exactly 12 misconception IDs (M01-M12) and exactly 16 core item IDs (Q01-Q16). The specification requires multiple hypotheses, diagnostic questions, contrast cases, transfer checks, and Bayesian uncertainty rather than a forced single label.

## 2. Files

- `misconceptions.json`: 12 operational misconception definitions and diagnostic metadata.
- `items.json`: 16 core algebra items with answers, verified steps, item purpose, expected response patterns, and alternative explanations.
- `response_matrix.json`: complete 16-by-12 matrix. Each cell is `correct`, `wrong`, `unknown`, or `not_applicable`.
- `contrast_cases.json`: 12 near-identical contrast pairs showing where a faulty rule can appear to work and where it fails.
- `transfer_tests.json`: resolution policy plus transfer templates. These templates are deliberately not assigned QIDs, so the core count remains exactly 16.
- `dataset_documentation.md`: this schema, integration guidance, assumptions, validation report, and limitations.

## 3. Response categories

Each response-matrix cell has:
- `correct`: the faulty rule happens to produce the correct response on this item.
- `wrong`: a specific incorrect response is predicted and the reasoning is recorded.
- `unknown`: the misconception may be relevant, but the rule does not uniquely determine a response.
- `not_applicable`: the item does not meaningfully exercise that misconception.

Never convert `unknown` to a made-up wrong answer.

## 4. Bayesian diagnosis

Use:

`P(M_i | A,Q) ∝ P(A | M_i,Q) P(M_i)`

The prior `P(M_i)` can start as a declared illustrative assumption. It must not be described as an empirical prevalence estimate unless pilot data support it.

The likelihood `P(A|M_i,Q)` should be calibrated from real response data when possible. A deterministic cell in this dataset is a qualitative prediction, not proof that the likelihood is 1.0.

A practical Python representation is:

```python
posterior = {m: prior[m] for m in misconception_ids}
for m in misconception_ids:
    posterior[m] *= likelihood(item_id, observed_response, m)
normalizer = sum(posterior.values())
posterior = {m: p / normalizer for m, p in posterior.items()}
```

Keep a trace for each update: item ID, observed answer, working-quality flag, likelihood assumptions, posterior before/after, and evidence for/against each hypothesis.

## 5. Diagnostic question selection

Use:

`IG(Q) = H(M) - E_A[H(M|A,Q)]`

with:

`H(M) = -Σ P(M_i) log2 P(M_i)`

Select questions that separate hypotheses with similar posterior mass. The dataset explicitly identifies Q02, Q03, Q08/Q14, Q15, and Q12 as useful separators for specific competing pairs.

No empirical information-gain score is claimed here. If likelihoods are assumed for simulation, label the result illustrative. In production, estimate likelihoods from collected student responses.

## 6. LLM integration

Recommended LLM output schema:

```json
{
  "observed_answer": "...",
  "working": "...",
  "working_valid": true,
  "hypotheses": [
    {
      "misconception_id": "M01",
      "posterior": 0.0,
      "evidence_for": ["..."],
      "evidence_against": ["..."],
      "confidence_basis": "response_matrix + calibrated likelihood"
    }
  ],
  "next_question_id": "Q02",
  "reason": "separates the top competing hypotheses"
}
```

The LLM should interpret mathematical working, but the probability update should remain auditable. Do not let the LLM silently replace an `unknown` matrix entry with a confident diagnosis.

## 7. Mastery / resolution policy

A misconception is resolved only after:
1. teaching/contrast intervention,
2. transfer variant 1 answered correctly with valid working,
3. transfer variant 2 answered correctly with valid working,
4. the two successes are consecutive,
5. the two answers are independently checked,
6. a failure or invalid working triggers re-diagnosis rather than resolution.

A correct final answer without adequate working does not automatically establish mastery.

The transfer file intentionally includes anti-memorization controls: changed numbers, changed surface forms, working requirements, and no reuse of exact teaching wording.

## 8. Design assumptions

- Target learners are middle-school/early-secondary students learning introductory algebra.
- Response predictions are observable mathematical patterns, not psychological explanations.
- `unknown` is preferred over an unsupported deterministic prediction.
- Some contrast cases intentionally exploit edge cases such as multiplying by 1 or adding zero; these show why a shortcut can appear to work without being a reliable rule.
- The response matrix is a diagnostic model specification, not a validated psychometric instrument.

## 9. Validation report

Automated structural checks performed before packaging:
- exactly 12 unique misconception IDs: PASS
- exactly 16 unique item IDs: PASS
- exactly 16 matrix rows and 12 misconception columns: PASS
- all referenced core IDs exist: PASS
- all matrix categories are in the allowed set: PASS
- each misconception has a representative item and at least two referenced other/transfer items: PASS
- contrast cases: 12 pairs, one per misconception: PASS
- transfer policy requires two consecutive independently checked successes: PASS
- JSON parse checks for all JSON files: PASS
- core answer keys and listed solution steps were reviewed for arithmetic consistency: PASS

### Known limitations

1. The core 16 items cannot provide two independent transfer questions for every one of the 12 misconceptions without sacrificing diagnostic coverage. The transfer templates therefore extend the evaluation layer without adding QIDs.
2. M04 and M10 have comparatively narrow core-item coverage.
3. M01 and M02 are deliberately confounded on Q01; later items separate them.
4. M03/M07 and M03/M08 can also produce the same wrong response on simple one-step equations. The next-question policy must use items that change the operation type.
5. The likelihood values needed for production Bayesian inference are not empirically estimated in this dataset.
6. The dataset is suitable as an engineering prototype and pilot instrument, not as a validated assessment scale.

## 10. Source alignment

The dataset preserves the requested 12-misconception/16-item constraint, response matrix, diagnostic-question, contrast-case, transfer, Bayesian, information-gain, machine-readable, and validation requirements from the supplied Re:Learn specification.
