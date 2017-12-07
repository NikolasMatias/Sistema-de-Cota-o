Vue.component('v-select', VueSelect.VueSelect);

new Vue({
    el: '#currency',
    data: {
        resultCurrency: {},
        currencies: [
            'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
            'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR', 'EUR'
        ],
        currentCurrency: 'BRL',
        filterCurrency: '',
        currentCurrencyGraphic: 'USD',
        currentPeriod: '',
        periods: [
            'Mensal'
        ],
        currentFilterPeriod: '',
        filterPeriods: [],
        dataGraphic: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        }
    },
    watch: {
        currentCurrencyGraphic: function () {
            if ((this.currentPeriod !== null && this.currentPeriod !== '') && (this.currentFilterPeriod !== null && this.currentFilterPeriod !== '')) {
                this.getLineGraphic();
            }
        },
        currentCurrency: function () {
            this.getLatestCurrency();
        },
        filterCurrency: function () {
            this.getLatestCurrency();
        },
        currentPeriod: function (currentPeriod) {
            let self = this;
            let actualYear = (new Date()).getFullYear();
            let years = 1999;
            this.filterPeriods = [];

            switch (currentPeriod) {
                case 'Mensal':
                    for (;actualYear>=years;actualYear--) {
                        self.filterPeriods.push({label: ('Dezembro de '+actualYear).toString(), value: actualYear+'-12'});
                        self.filterPeriods.push({label: ('Novembro de '+actualYear).toString(), value: actualYear+'-11'});
                        self.filterPeriods.push({label: ('Outubro de '+actualYear).toString(), value: actualYear+'-10'});
                        self.filterPeriods.push({label: ('Setembro de '+actualYear).toString(), value: actualYear+'-09'});
                        self.filterPeriods.push({label: ('Agosto de '+actualYear).toString(), value: actualYear+'-08'});
                        self.filterPeriods.push({label: ('Julho de '+actualYear).toString(), value: actualYear+'-07'});
                        self.filterPeriods.push({label: ('Junho de '+actualYear).toString(), value: actualYear+'-06'});
                        self.filterPeriods.push({label: ('Maio de '+actualYear).toString(), value: actualYear+'-05'});
                        self.filterPeriods.push({label: ('Abril de '+actualYear).toString(), value: actualYear+'-04'});
                        self.filterPeriods.push({label: ('Março de '+actualYear).toString(), value: actualYear+'-03'});
                        self.filterPeriods.push({label: ('Fevereiro de '+actualYear).toString(), value: actualYear+'-02'});
                        self.filterPeriods.push({label: ('Janeiro de '+actualYear).toString(), value: actualYear+'-01'});
                    }
                    break;
                case 'Semanal':
                    let halfBoolean = true;

                    for (;actualYear>=years;) {
                        if (halfBoolean) {
                            self.filterPeriods.push({label: 'Semestre 1 '+actualYear, value: actualYear+'-01'});
                            halfBoolean = false;
                        } else {
                            self.filterPeriods.push({label: 'Semestre 2 '+actualYear, value: actualYear+'-07'});
                            halfBoolean = true;
                            actualYear--;
                        }
                    }
                    break;
                case 'Anual':
                    for (;actualYear >= years;actualYear--) {
                        self.filterPeriods.push({label: actualYear.toString(), value: actualYear+'-01'});
                    }
                    break;
            }
        },
        currentFilterPeriod: function (currentFilterPeriod) {
            this.getLineGraphic();
        }
    },
    mounted: function () {
        this.getLatestCurrency();
        this.currentPeriod = 'Mensal';
    },
    methods: {
        getLineGraphic: function () {
            let self = this;
            self.getGrapicValues();
            let ctx = document.getElementById('currencyGraphic').getContext('2d');
            let options = {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            };

            let myChart = '';
            setTimeout(function () {
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: self.dataGraphic,
                    options: options
                });
            }, 3000);
        },
        getGrapicValues: function () {
            let self = this;
            let base= '?base='+this.currentCurrency;
            let symbols = '&symbols='+this.currentCurrencyGraphic;
            let data = [];

            this.dataGraphic = {
              labels: [],
              datasets: [{
                  label: '',
                  data: [],
                  backgroundColor: [],
                  borderColor: [],
                  borderWidth: 1
              }]
            };
            let startDate = this.currentFilterPeriod.value;

            let graphicContent = document.getElementById('graphic-content');
            let canvasGraphic = document.getElementById('currencyGraphic');

            graphicContent.removeChild(canvasGraphic);

            let newCanvas = document.createElement('canvas');

            newCanvas.setAttribute('id', 'currencyGraphic');
            newCanvas.setAttribute('width', '500');
            newCanvas.setAttribute('height', '200');

            graphicContent.appendChild(newCanvas);

            switch (this.currentPeriod) {
                case 'Mensal':
                    let daysInMonth = moment(startDate, 'YYYY-MM').daysInMonth();
                    let dateUsed = startDate;
                    self.dataGraphic.datasets[0].label = this.currentFilterPeriod.label;


                    for (let i=1; i<=daysInMonth; i++) {
                        data[i] = {
                            labels: '',
                            data: ''
                        };

                        dateUsed = startDate;
                        if (i <= 9) {
                            dateUsed = dateUsed+'-0'+i;
                        } else {
                            dateUsed = dateUsed+'-'+i;
                        }

                        axios.get('https://api.fixer.io/'+dateUsed+base+symbols).then(function (result) {
                            let dataNumber = i;
                            if (i <= 9) {
                                data[dataNumber]['labels'] = '0'+dataNumber;
                            } else {
                                // rgba(137, 207, 240, 1)
                                data[dataNumber]['labels'] = dataNumber.toString();
                            }
                            data[i]['data'] = result.data['rates'][self.currentCurrencyGraphic];
                        }).catch(function (errors) {
                            console.log(errors);
                        });
                    }

                    setTimeout(function () {
                        for (let j=1;j<daysInMonth;j++) {
                            self.dataGraphic.labels.push(data[j].labels);
                            self.dataGraphic.datasets[0].data.push(data[j].data);
                            self.dataGraphic.datasets[0].backgroundColor.push('rgba(137, 207, 240, .5)');
                            self.dataGraphic.datasets[0].borderColor.push('rgba(137, 207, 240, 1)');
                        }
                    }, 2500);
                    break;
                case 'Semanal':

                    break;
                case 'Anual':
                    break;
            }
        },
        getLatestCurrency: function () {
            let self = this;
            let filter = '';
            let currency = '';

            if (this.currentCurrency !== null && this.currentCurrency !== '') {
                currency = 'base='+this.currentCurrency;
            }

            if (this.filterCurrency !== null && this.filterCurrency !== '') {
                filter = '&symbols='+this.filterCurrency
            }

            //https://api.fixer.io/latest?base=BRL&symbols=BRL,USD
            axios.get('https://api.fixer.io/latest?'+currency+filter).then(function (result) {
                self.resultCurrency = result.data;
            }.bind(this)).catch(function (errors) {
                console.log(errors);
            }.bind(this));
        },
        getGraphicsCurrency: function () {
            axios.get('https://api.fixer.io/latest?base='+this.currentCurrency).then(function (result) {
                console.log(result.data);
                self.resultCurrency = result.data;
            }.bind(this)).catch(function (errors) {
                console.log(errors);
            }.bind(this));
        },
        isEmpty: function (map) {
            let empty = true;

            for(let key in map) {
                empty = false;
                break;
            }

            return empty;
        }
    }
});