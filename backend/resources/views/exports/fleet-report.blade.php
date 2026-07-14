<!DOCTYPE html>
<html>
<head>
    <title>FleetFlow - Fleet Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #1a56db; color: white; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .kpi-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
        .kpi-box { background: #f3f4f6; padding: 12px; border-radius: 6px; width: 30%; text-align: center; }
        .kpi-value { font-size: 20px; font-weight: bold; color: #1a56db; }
        .kpi-label { font-size: 11px; color: #6b7280; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 10px; }
    </style>
</head>
<body>
    <h1>FleetFlow Fleet Report</h1>
    <p><strong>Generated:</strong> {{ now()->format('F j, Y H:i') }}</p>
    <p><strong>Period:</strong> {{ $performance['date_from'] }} to {{ $performance['date_to'] }}</p>

    <h2>Dashboard KPIs</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Fleet Size</td><td>{{ $kpis['fleet_size'] }}</td></tr>
        <tr><td>Available Vehicles</td><td>{{ $kpis['available_vehicles'] }}</td></tr>
        <tr><td>Active Trips</td><td>{{ $kpis['active_trips'] }}</td></tr>
        <tr><td>Total Drivers</td><td>{{ $kpis['total_drivers'] }}</td></tr>
        <tr><td>Upcoming Maintenance</td><td>{{ $kpis['upcoming_maintenance'] }}</td></tr>
    </table>

    <h2>Fleet Performance</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Trips</td><td>{{ $performance['total_trips'] }}</td></tr>
        <tr><td>Total Distance</td><td>{{ number_format($performance['total_distance_km'], 2) }} km</td></tr>
        <tr><td>Total Revenue</td><td>${{ number_format($performance['total_revenue'], 2) }}</td></tr>
        <tr><td>Total Cost</td><td>${{ number_format($performance['total_cost'], 2) }}</td></tr>
        <tr><td>Net Profit</td><td>${{ number_format($performance['net_profit'], 2) }}</td></tr>
        <tr><td>Avg Cost/Trip</td><td>${{ number_format($performance['avg_cost_per_trip'], 2) }}</td></tr>
        <tr><td>Fuel Efficiency</td><td>{{ $performance['fuel_efficiency_km_per_liter'] }} km/L</td></tr>
    </table>

    <h2>Financial Summary</h2>
    <table>
        <tr><th>Category</th><th>Amount</th></tr>
        <tr><td>Revenue</td><td>${{ number_format($financial['total_revenue'], 2) }}</td></tr>
        <tr><td>Fuel Cost</td><td>${{ number_format($financial['fuel_cost'], 2) }}</td></tr>
        <tr><td>Maintenance Cost</td><td>${{ number_format($financial['maintenance_cost'], 2) }}</td></tr>
        <tr><td>Other Expenses</td><td>${{ number_format($financial['total_other_expenses'], 2) }}</td></tr>
        <tr><td><strong>Total Operational Cost</strong></td><td><strong>${{ number_format($financial['total_operational_cost'], 2) }}</strong></td></tr>
        <tr><td><strong>Net Profit</strong></td><td><strong>${{ number_format($financial['net_profit'], 2) }}</strong></td></tr>
        <tr><td>Profit Margin</td><td>{{ $financial['profit_margin'] }}%</td></tr>
    </table>

    <div class="footer">
        <p>FleetFlow &copy; {{ date('Y') }} — Confidential Fleet Report</p>
    </div>
</body>
</html>
