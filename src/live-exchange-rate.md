# Live Exchange Rate

<div
	class="fx-table"
	data-fx-base="CNY"
	data-fx-quotes="USD,EUR,GBP,JPY"
	data-fx-source="https://api.frankfurter.dev/v2/rates?base=CNY&quotes=USD,EUR,GBP,JPY"
>
	<table>
		<caption>
			Live exchange rate on
			<time datetime="2026-02-06">Feb 6, 2026</time
			><span id="frankfurter-fallback-message"
				><br />(frankfurter API stuck, this is a fallback)</span
			>
		</caption>
		<thead>
			<tr>
				<th>Currency</th>
				<th>Code</th>
				<th>1 XXX approx. CNY</th>
				<th>1 CNY approx. XXX</th>
			</tr>
		</thead>
		<tbody>
			<tr data-currency="USD">
				<td>US dollar</td>
				<td>USD</td>
				<td>approx. <data value="6.94">6.94</data> CNY</td>
				<td>approx. <data value="0.14">0.14</data> USD</td>
			</tr>
			<tr data-currency="EUR">
				<td>Euro</td>
				<td>EUR</td>
				<td>approx. <data value="8.18">8.18</data> CNY</td>
				<td>approx. <data value="0.12">0.12</data> EUR</td>
			</tr>
			<tr data-currency="GBP">
				<td>British pound</td>
				<td>GBP</td>
				<td>approx. <data value="9.40">9.40</data> CNY</td>
				<td>approx. <data value="0.11">0.11</data> GBP</td>
			</tr>
			<tr data-currency="JPY">
				<td>Japanese yen</td>
				<td>JPY</td>
				<td>approx. <data value="0.04">0.04</data> CNY</td>
				<td>approx. <data value="23">23</data> JPY</td>
			</tr>
		</tbody>
	</table>
	<p class="fx-note">
		Actual settlement uses the exchange rate on the day of final payment. The
		table above is a reference snapshot and will update at page load when the
		latest available Frankfurter reference rate can be fetched.
	</p>
</div>

## Acknowledgement

[frankfurter.dev](https://frankfurter.dev/) — Used for real-time exchange rates.
