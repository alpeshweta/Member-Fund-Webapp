export type RagColour = 'Green' | 'Amber' | 'Red' | null
export type PassFail = 'Pass' | 'Fail' | 'Unknown' | null

/** Shared metric fields present on both MySuperProduct and TdpProduct. */
export interface FundMetrics {
  current_metrics_available: boolean
  nir_10yr: number | null
  nir_rag: RagColour
  fees_50k: number | null
  fees_50k_rag: RagColour
  fees_100k: number | null
  fees_100k_rag: RagColour
}

export interface MySuperProduct {
  product_name: string
  current_metrics_available: boolean
  pass_fail_current: PassFail
  nir_10yr: number | null
  nir_rag: RagColour
  fees_50k: number | null
  fees_50k_rag: RagColour
  fees_100k: number | null
  fees_100k_rag: RagColour
  history: Record<string, PassFail>
}

export interface TdpProduct {
  product_name: string
  investment_menu_name: string
  investment_option_name: string
  product_type: 'Platform TDP' | 'Non-platform TDP'
  current_metrics_available: boolean
  pass_fail_current: PassFail
  nir_10yr: number | null
  nir_rag: RagColour
  fees_50k: number | null
  fees_50k_rag: RagColour
  fees_100k: number | null
  fees_100k_rag: RagColour
  history: Record<string, PassFail>
}

export interface PerformanceMeta {
  last_updated: string
  source_years_mysuper: string[]
  source_years_tdp: string[]
  total_mysuper_products: number
  total_tdp_options: number
}

export interface PerformanceData extends PerformanceMeta {
  mysuper_products: MySuperProduct[]
  tdp_products: TdpProduct[]
}
