import { Redirect } from "expo-router";

/**
 * Dashboard como prontuário eletrônico profissional (redesign v3): duas
 * variantes em comparação, /dashboard-a e /dashboard-b (seletor no topo de
 * cada uma). "/" redireciona para a Variante A como padrão provisório —
 * apague esta rota e a variante não escolhida quando a decisão for tomada.
 */
export default function Index() {
  return <Redirect href="/dashboard-a" />;
}
