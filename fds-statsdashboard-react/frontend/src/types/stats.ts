export type StatsRangeType = 'TODAY' | 'LAST_7_DAYS'

export type UserSummaryResponse = {
  range: string
  transactionCount: number
  totalAmount: number | null
  averageAmount: number | null
  detectedCount: number
  detectedRate: number | string
  fraudCount: number
  fraudRate: number | string
  averageFraudProbability: number | null
  medianFraudProbability: number | null
  latestTransactionAt: string | null
  latestDetectionAt: string | null
}

export type UserDashboardResponse = {
  profile: {
    userId: number
    loginId: string
    name: string
    createdAt: string | null
  }
  accounts: Array<{
    accountId: number
    accountNumber: string
    status: string | null
    balance: number | null
    createdAt: string | null
  }>
  cards: {
    cardCount: number
    averageCardsPerUser: number | null
    statusCounts: Record<string, number>
    typeCounts: Record<string, number>
    issuerCounts: Record<string, number>
  }
  transactions: {
    transactionCount: number
    totalAmount: number | null
    averageAmount: number | null
    typeCounts: Record<string, number>
    dailyCounts: Array<{ date: string; count: number }>
    recentTransactions: Array<{
      transactionId: number
      transactionAt: string | null
      amount: number | null
      merchantName: string | null
      location: string | null
      targetAccountNumber: string | null
      description: string | null
    }>
  }
  detections: {
    detectedCount: number
    fraudCount: number
    fraudRate: number | string
    latestDetectionAt: string | null
  }
}

export type AdminDashboardResponse = {
  range: {
    fromDate: string
    toDate: string
  }
  users: {
    totalUsers: number
    newUsersTrend: Array<{ date: string; count: number }>
    genderDistribution: Record<string, number>
    ageDistribution: Record<string, number>
  }
  accounts: {
    totalAccounts: number
    newAccountsTrend: Array<{ date: string; count: number }>
    statusDistribution: Record<string, number>
    averageBalanceByGenderAge: Array<{
      gender: string
      ageGroup: string
      averageBalance: number | null
    }>
    accountsPerUserDistribution: Record<string, number>
  }
  cards: {
    totalCards: number
    newCardsTrend: Array<{ date: string; count: number }>
    statusDistribution: Record<string, number>
    typeDistribution: Record<string, number>
    issuerDistribution: Record<string, number>
    cardsPerUserDistribution: Record<string, number>
    cardsPerAccountDistribution: Record<string, number>
  }
  transactions: {
    totalTransactions: number
    dailyTrend: Array<{ date: string; count: number }>
    hourlyDistribution: Record<string, number>
    amountSummary: { total: number | null; average: number | null }
    typeDistribution: Record<string, number>
    merchantStats: FieldStats
    locationStats: FieldStats
    targetAccountStats: FieldStats
    descriptionStats: FieldStats
    topAccountsByCount: Array<{ name: string; count: number }>
    topAccountsByAmount: Array<{ name: string; amount: number | null }>
    topUsersByCount: Array<{ name: string; count: number }>
    topUsersByAmount: Array<{ name: string; amount: number | null }>
  }
  transactionFeatures: {
    transactionCount: number
    featureCount: number
    coverageRate: number | string
    balanceSummaries: Array<{
      name: string
      min: number | null
      max: number | null
      average: number | null
    }>
    vFeaturesCount: number
    averageFeaturesLength: number | null
  }
  detections: {
    detectionCount: number
    detectionTrend: Array<{ date: string; count: number }>
    detectionCoverage: number | string
    averageDetectionDelayMinutes: number | null
    fraudCount: number
    fraudRate: number | string
    fraudProbabilityDistribution: Record<string, number>
    engineDistribution: Record<string, number>
    actionDistribution: Record<string, number>
    thresholdDistribution: Record<string, number>
    thresholdExceedRate: number | string
  }
  fraudReports: {
    totalReports: number
    reportTrend: Array<{ date: string; count: number }>
    statusDistribution: Record<string, number>
    reasonTop: Array<{ name: string; count: number }>
    distinctAccountCount: number
    duplicateRate: number | string
    topAccounts: Array<{ name: string; count: number }>
    reportedAccountDetectionRate: number | string
    reportedAccountFraudRate: number | string
  }
  blacklist: {
    totalBlacklist: number
    newBlacklistTrend: Array<{ date: string; count: number }>
    reasonDistribution: Record<string, number>
    distinctAccountCount: number
    duplicateCount: number
    relatedTransactionCount: number
    relatedDetectionCount: number
  }
  referenceData: {
    codebookCount: number
    codebookCreatedTrend: Array<{ date: string; count: number }>
    codebookUpdatedTrend: Array<{ date: string; count: number }>
    codeTypeDistribution: Record<string, number>
    activeCount: number
    inactiveCount: number
    metaJsonCount: number
    descriptionMissingCount: number
    sortOrderDistribution: Record<string, number>
    configEntries: Array<{
      configKey: string
      configValue: string
      description: string | null
    }>
  }
  crossEntity: {
    segmentMetrics: Array<{
      segmentType: string
      segmentValue: string
      transactionCount: number
      detectedCount: number
      fraudCount: number
    }>
    accountRanking: Array<{
      accountNumber: string
      transactionCount: number
      detectedCount: number
      fraudCount: number
    }>
    merchantBreakdown: Record<string, number>
    locationBreakdown: Record<string, number>
    targetAccountBreakdown: Record<string, number>
    transactionTypeBreakdown: Record<string, number>
    amountBuckets: Array<FraudBucket>
    hourBuckets: Array<FraudBucket>
    typeBuckets: Array<FraudBucket>
    engineActionComparisons: Array<{
      engine: string
      action: string
      averageFraudProbability: number | null
      fraudRate: number | string
    }>
    blacklistDetectionRate: number | string
  }
}

export type FieldStats = {
  totalCount: number
  missingCount: number
  missingRate: number | string
  topValues: Array<{ name: string; count: number }>
}

export type FraudBucket = {
  bucket: string
  transactionCount: number
  fraudCount: number
  fraudRate: number | string
  averageFraudProbability: number | null
}

export type SnapshotScope = 'GENERAL' | 'BUSINESS'

export type SnapshotMetadata = {
  snapshotId: string
  scope: SnapshotScope
  fromDate: string
  toDate: string
  generatedAt: string | null
  filename: string
}

export type SnapshotKpi = {
  transactionCount: number
  totalAmount: number | null
  averageAmount: number | null
  detectedCount: number
  detectedRate: number | string
  fraudCount: number
  fraudRate: number | string
  averageFraudProbability: number | null
  medianFraudProbability: number | null
  latestTransactionAt: string | null
  latestDetectionAt: string | null
}

export type GeneralSnapshotDetail = {
  scope: 'GENERAL'
  fromDate: string
  toDate: string
  generatedAt: string | null
  kpi: SnapshotKpi
}
