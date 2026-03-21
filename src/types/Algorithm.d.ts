interface Algorithm {
  name: string;
  subtitle: string;
  description: string;
  strength: AlgoStrength;
  detail: string;
}
type AlgoStrength = 1 | 2 | 3 | 4 | 5;
