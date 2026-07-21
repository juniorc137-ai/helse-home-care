import { Children } from "react";
import type { ReactNode } from "react";
import { Platform, useWindowDimensions, View } from "react-native";

interface WebGridProps {
  minItemWidth: number;
  gap: number;
  children: ReactNode;
}

/**
 * Grid CSS de verdade no web (grid-template-columns com auto-fill/minmax) —
 * nunca deixa cards "colados" de um lado só, preenche a largura inteira em
 * qualquer tamanho ≥ 1024px. React Native não tem CSS Grid nativo; no
 * nativo, calcula o número de colunas pela largura da tela e distribui os
 * itens em porcentagem exata (mesmo efeito, sem depender de flexWrap com
 * largura fixa — que é a causa do "hanging" de um lado).
 */
export function WebGrid({ minItemWidth, gap, children }: WebGridProps) {
  const { width } = useWindowDimensions();

  if (Platform.OS === "web") {
    return (
      <View
        style={
          {
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
            gap,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        {children}
      </View>
    );
  }

  const columns = Math.max(1, Math.floor(width / (minItemWidth + gap)));
  const itemWidthPct = 100 / columns;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {Children.map(children, (child) => (
        <View style={{ width: `${itemWidthPct}%`, padding: gap / 2 }}>{child}</View>
      ))}
    </View>
  );
}
