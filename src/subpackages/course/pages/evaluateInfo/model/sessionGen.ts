let sessionGen = 0;

export function bumpEvaluationDetailSession(): number {
  sessionGen += 1;
  return sessionGen;
}

export function getEvaluationDetailSessionGen(): number {
  return sessionGen;
}
