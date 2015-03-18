import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['usage'],
	templateName: 'piechart',
	chartOptions : {
		labelOffset: 30,
		chartPadding: 50,
		startAngle: 270,
		width: '340px',
		height: '180px',
		labelDirection: 'explode',
		labelInterpolationFnc: function(value) {
			return value;
		}
	},
	drawn: false,
	draw: function() {
		if (this._state=="inDOM") {
			var id = '#'+this.get('elementId')+' .ct-chart';
			var data = this.get('controller').get('chartData')
			if(this.get('drawn')) {
				$(id).empty();
			}
			else {
				this.set('drawn', true);
			}

			// we could ignore zero size in pies and show them only in legend
			var series = data.series;
			var seriesWithUnits = data.seriesWithUnits;
			var labels = [];
			data.percent.forEach(function(percent, index) {
				let label = seriesWithUnits[index] + ' (' + percent + '%)';
				labels.push(label);
			});
			var data = {
			labels: labels,
			series: series
		};

		var options = this.get('chartOptions');
		new Chartist.Pie(id, data, options);
		}
	}.observes('controller.chartData').on('didInsertElement'),

	didInsertElement: function() {
	}
});
