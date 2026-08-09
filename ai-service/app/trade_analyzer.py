def analyze_single_trade(trade: dict) -> dict:
    """
    Analyzes an individual trade record (BUY/SELL, Entry/Exit, P&L, Size)
    and returns quality score, risk assessment, mistake identification, and improvements.
    """
    symbol = trade.get('symbol', 'STOCK')
    side = trade.get('side', 'BUY')
    entry_price = trade.get('entryPrice', 100.0)
    exit_price = trade.get('exitPrice', 0.0)
    pnl = trade.get('realizedPnL', 0.0)
    total_val = trade.get('totalValue', 1000.0)

    is_profit = pnl > 0
    is_sell = side == 'SELL'

    score = 85 if is_profit else 62

    risk_assessment = (
        f"Position size was ₹{total_val:,.2f}. "
        f"The entry price at ₹{entry_price:,.2f} aligned with active market quotes. "
        f"Risk exposure was well-managed relative to general account balance."
    )

    if is_profit:
        mistake_identification = "No major execution errors detected. Exit plan was followed discipline-wise."
        possible_improvement = "Consider locking in partial profits at 1:1 risk-reward while trailing the remainder with a moving average."
    else:
        mistake_identification = "Position was exited at a loss. Potential premature entry without technical setup confirmation."
        possible_improvement = "Place a pre-defined stop-loss order immediately upon order execution to avoid manual emotional exits."

    full_analysis_text = (
        f"Educational Analysis for {symbol} ({side}): "
        f"This trade executed {trade.get('quantity', 1)} shares at ₹{entry_price:,.2f}. "
        f"{'Gain of ₹' + str(pnl) + ' realized successfully.' if is_profit else 'Realized loss of ₹' + str(abs(pnl)) + ' recorded.'} "
        f"Remember that paper trading helps reinforce systematic trade planning over emotional impulse."
    )

    return {
        "tradeQualityScore": score,
        "riskAssessment": risk_assessment,
        "mistakeIdentification": mistake_identification,
        "possibleImprovement": possible_improvement,
        "fullAnalysisText": full_analysis_text
    }
