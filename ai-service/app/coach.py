def analyze_user_portfolio_behavior(data: dict) -> dict:
    """
    Evaluates real user trading metrics and generates data-driven scores,
    behavioral insights, and tailored recommendations.
    """
    performance = data.get('performance', {})
    risk = data.get('risk', {})
    behavior = data.get('behavior', {})
    holdings = data.get('holdings', [])

    win_rate = performance.get('winRate', 65.0)
    profit_factor = performance.get('profitFactor', 1.5)
    conc = risk.get('portfolioConcentration', 25.0)
    max_dd = risk.get('maxDrawdown', 3.0)
    sharpe = risk.get('sharpeRatio', 1.2)
    buy_sell_ratio = behavior.get('buySellRatio', 1.0)
    total_trades = behavior.get('totalTrades', 0)

    # 1. Compute Scores (0 to 100)
    overall_score = min(98, max(45, round((win_rate * 0.35) + (sharpe * 20) + (profit_factor * 12) + 15)))
    risk_score = min(98, max(35, round(100 - (conc * 0.5) - (max_dd * 4.0))))
    strategy_score = min(98, max(40, round((profit_factor * 28) + (win_rate * 0.2) + 20)))

    # 2. Generate Behavioral Insights based on actual data thresholds
    insights = []

    if conc > 35:
        insights.append(f"High concentration risk: Your top position makes up {conc}% of your portfolio.")
    else:
        insights.append(f"Balanced portfolio allocation: Top holding represents {conc}% of total capital.")

    if win_rate >= 60:
        insights.append(f"High win-rate execution ({win_rate}%). Your entry setups demonstrate positive statistical edge.")
    else:
        insights.append(f"Win rate is at {win_rate}%. Focus on improving entry precision and risk-to-reward ratios.")

    if buy_sell_ratio > 3.0:
        insights.append(f"Heavy buying bias (Buy/Sell ratio: {buy_sell_ratio}). You accumulate stocks but delay taking profits.")
    elif buy_sell_ratio < 0.5 and total_trades > 3:
        insights.append(f"High selling activity relative to purchases. Ensure you are not over-trading out of fear.")

    if max_dd > 8.0:
        insights.append(f"Portfolio drawdown reached {max_dd}%. Strict stop-loss rules are required.")
    else:
        insights.append(f"Capital preservation is disciplined with maximum drawdown limited to {max_dd}%.")

    # 3. Formulate Actionable Recommendations
    recommendations = []

    if conc > 30:
        recommendations.append("Rebalance portfolio: Reduce top single position below 20% to avoid single-stock market shocks.")
    recommendations.append("Apply the 2% position sizing rule: Never risk more than 2% of total virtual capital on one trade.")
    if profit_factor < 1.5:
        recommendations.append("Let winners run longer: Allow profit targets to reach at least 2:1 reward-to-risk ratio before exiting.")
    recommendations.append("Maintain strict emotional discipline: Avoid revenge trading immediately after a losing trade.")

    return {
        "overallScore": overall_score,
        "riskScore": risk_score,
        "strategyScore": strategy_score,
        "insights": insights,
        "recommendations": recommendations
    }
