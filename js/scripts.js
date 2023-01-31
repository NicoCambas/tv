/*
DOC:
	https://momentjs.com/
	https://vuejs.org/v2/guide/
	https://github.com/theofidry/ephemeris
	https://sunrise-sunset.org/api

	https://www.chartjs.org/docs/latest/getting-started/installation.html

	https://www.raymondcamden.com/2018/03/19/building-a-customizable-weather-app-in-vue
	https://openweathermap.org/current

	API EVENEMENTS : 	http://wcf.tourinsoft.com/Syndication/3.0/cdt71/664d2684-7a2d-440d-ae08-49680f6b5e4a/Objects?$expand=CALENDRIERs&$format=json
						{clientId} cdt71
						{syndicId} 664d2684-7a2d-440d-ae08-49680f6b5e4a
*/

// Initialisation des librairies
moment().format();
moment.locale('fr');


///////////////////////////////////////////////////////////////////////////
// EPHEMERIDES
const ephemeride = new Vue({
	el: '#ephemeride',
	data: {
		dateDuJour: '',
		saintDuJour: '',
		soleilLever: '',
		soleilCoucher: ''
	},

	created() {
		// Lever - coucher du soleil
		// Coord Chalon : la: 46.7833 Lon: 4.85
		axios.get("https://api.sunrise-sunset.org/json?lat=46.7833&lng=4.85&date=today&formatted=0")
			.then(response => {
					this.soleilLever = moment(response.data.results.sunrise).format('HH[h]mm'),
					this.soleilCoucher = moment(response.data.results.sunset).format('HH[h]mm'),
					localStorage.setItem("soleilLever", this.soleilLever),
					localStorage.setItem("soleilCoucher", this.soleilCoucher)
					})
			.catch(
				error => console.log(error),
				this.soleilLever = localStorage.getItem("soleilLever"),
				this.soleilCoucher = localStorage.getItem("soleilCoucher")
			),
		this.dateDuJour = moment().format('dddd Do MMMM YYYY'),
		this.saintDuJour = ephemeris.getTodayEphemerisName()
	},
	mounted() {
		this.ephemerideAnimate()
	},
	methods: {
		ephemerideAnimate() {
			var elem = document.getElementById('ephemeride');
			setTimeout(() => {  elem.classList.add("animSlideBlurRight") }, 800);
		}

	}
})

///////////////////////////////////////////////////////////////////////////
// METEO
//
//	API Weather : http://api.openweathermap.org/data/2.5/weather?q=Chalon-sur-Saone,fr&units=metric&APPID=972a15c123c2a125182e514b77215c24&lang=fr
//	API Weather : http://api.openweathermap.org/data/2.5/forecast?q=Chalon-sur-Saone,fr&units=metric&APPID=972a15c123c2a125182e514b77215c24&lang=fr
//	Key : 972a15c123c2a125182e514b77215c24

const meteo = new Vue({
	el: '#meteo',
	data: {
		meteoNow: {},
		meteoPrevisions: [],
		timer: 0
	},
	created () {
		this.fetchMeteo();
		this.timer = setInterval(this.fetchMeteo, 600000);
	},
	mounted() {
		this.meteoAnimate()
	},
	methods: {
		fetchMeteo () {
			axios.get("http://api.openweathermap.org/data/2.5/forecast?q=Chalon-sur-Saone,fr&units=metric&APPID=972a15c123c2a125182e514b77215c24&lang=fr")
				.then(response => {
							this.meteoNow = this.meteoGetNow(response.data),
							this.meteoPrevisions = this.meteoGetPrevisions(response.data),
							localStorage.setItem("meteo", JSON.stringify(response.data))
						})
				.catch(
					error => console.log("NC Meteo : " + error),
					this.meteoNow = this.meteoGetNow(JSON.parse(localStorage.getItem("meteo"))),
					this.meteoPrevisions = this.meteoGetPrevisions(JSON.parse(localStorage.getItem("meteo")))
				)
		},
		meteoAnimate() {
			var elem = document.getElementById('meteo');
			setTimeout(() => {  elem.classList.add("animSlideBlurRight") }, 1300);
		},

		meteoGetNow(meteo_allData) {

			function meteoObject(time, temp, wind, windDirection, description, icon) {
				this.time = time;
				this.temp = temp;
				this.wind = wind;
				this.windDirection = windDirection;
				this.description = description;
				this.icon = icon;
			}

			var meteObj = new meteoObject(
				moment(meteo_allData.list[0].dt_txt).format('HH[h]mm'),
				Math.round(meteo_allData.list[0].main.temp),
				(meteo_allData.list[0].wind.speed * 3.6).toFixed(0) + " km/h",
				"wi wi-wind towards-" + meteo_allData.list[0].wind.deg + "-deg",
				meteo_allData.list[0].weather[0].description,
				"wi wi-owm-" + meteo_allData.list[0].weather[0].id
			);

			return meteObj;
		},
		meteoGetPrevisions(meteo_allData) {
			var meteoData = [];

			function meteoObject(time, temp, description, icon) {
				this.time = time;
				this.temp = temp;
				this.description = description;
				this.icon = icon;
			}

			for (var i = 1; i <= 3; i++) {
				var meteObj = new meteoObject(
					moment(meteo_allData.list[i].dt_txt).format('HH[h]'),
					Math.round(meteo_allData.list[i].main.temp),
					meteo_allData.list[i].weather[0].description,
					"wi wi-owm-" + meteo_allData.list[i].weather[0].id
				);
				meteoData.push(meteObj);
			}
			return meteoData;
		}
	},
    beforeDestroy () {
      clearInterval(this.timer)
    }
})


///////////////////////////////////////////////////////////////////////////
// VIGICRUE
//
// http://hubeau.eaufrance.fr/page/api-hydrometrie
//
// API Vigicrue
// mieux : 		http://hubeau.eaufrance.fr/api/v1/hydrometrie/observations_tr?code_entite=U312001001&size=2&pretty&grandeur_hydro=H,Q&fields=date_obs,resultat_obs
// ancienne : 	https://public.opendatasoft.com/api/records/1.0/search/?dataset=vigicrues&lang=fr&rows=300&refine.station_id=U312001001&refine.timestamp="+ dateDuJour +"&timezone=Europe%2FParis
//				axios.get("https://public.opendatasoft.com/api/records/1.0/search/?dataset=vigicrues&lang=fr&rows=300&refine.station_id=U312001001&sort=timestamp")
//					.then(response => {
//								this.currentHeight = parseFloat(response.data.records[0].fields.hauteur) - 1.8,
//								this.currentDebit = parseFloat(response.data.records[0].fields.debit),
//								
//								localStorage.setItem("vigicrueHeight", this.currentHeight),
//								localStorage.setItem("vigicrueDebit", this.currentDebit)
//								//this.fuVigicrueChart(response.data.records)
//							})
const vigicrue = new Vue({
	el: '#vigicrue',
	data: {
		currentHeight: '',
		currentDebit: '',
		timer: 0
	},
	filters: {
		arrondiValeur (value) {
			value = parseFloat(value);
			return value.toFixed(2)
		}
	},
	created() {
		this.fetchVigicrue();
		this.timer = setInterval(this.fetchVigicrue, 600000);
	},
	mounted() {
		this.vigicrueAnimate()
	},
	methods: {
		vigicrueAnimate() {
			var elem = document.getElementById('vigicrue');
			setTimeout(() => {  elem.classList.add("animSlideBlurTop") }, 1300);
		},
		fetchVigicrue() {
			axios.get("https://hubeau.eaufrance.fr/api/v1/hydrometrie/observations_tr?code_entite=U312001001&size=4&pretty&grandeur_hydro=H,Q&fields=date_obs,resultat_obs")
				.then(response => {
							this.currentHeight = (parseFloat(response.data.data[0].resultat_obs) - 1800) / 1000,
							this.currentDebit = parseFloat(response.data.data[1].resultat_obs) / 1000,
							
							localStorage.setItem("vigicrueHeight", this.currentHeight),
							localStorage.setItem("vigicrueDebit", this.currentDebit)
							//this.fuVigicrueChart(response.data.records)
						})
				.catch(
					error => console.log("Erreur Vigicrue : " + error),
					this.currentHeight = localStorage.getItem("vigicrueHeight"),
					this.currentDebit = localStorage.getItem("vigicrueDebit")
				)
		},

		fuVigicrueChart(allHeightData) {

			var heights = [];
			var heures = [];
			for (var  i = allHeightData.length - 1; i >= 0; i--) {
				if(i % 5 == 0) {
					heights.push(allHeightData[i].fields.hauteur.toFixed(2)	);
					heures.push(allHeightData[i].fields.timestamp);
				}
			}

			var ctx = document.getElementById('vigicrueChart');
			var myChart = new Chart(ctx, {
				type: 'line',
				responsive: true,
				data: {
					datasets: [{
						label: 'Hauteur',
						fill: 'origin',
						data: heights,
						borderColor: ['rgba(21, 174, 182, 1)'],
						backgroundColor: ['rgba(21, 174, 182, .1)'],
						borderWidth: 2,
						borderCapStyle: 'round',
						pointRadius: 0,
						spanGaps: true
					}]
				},
				options: {
					animation: {
					    duration: 2000
					},
					legend: {
						display: false
					},
					tooltips: {
						enabled: false
					},
					scales: {
						xAxes: [{
			                type: 'time',
			                time: {
			                	unit: 'day',
								displayFormats: {
									hour: 'HH[h]',
									day: 'DD MMM'
								}
							},
			                labels: heures,
			                ticks: {
			                	source: 'auto',
			                	maxTicksLimit: 6
			                }
			            }],
			            yAxes: [{
			            	display: false,
							ticks: {
								min: 1.85,
								maxTicksLimit: 10,
								precision: 1,
								stepSize: .2
							}
			            }]
					}
				}
			});
		}

	}
})



///////////////////////////////////////////////////////////////////////////
// EVENEMENTS
//
// http://wcf.tourinsoft.com/Syndication/3.0/cdt71/664d2684-7a2d-440d-ae08-49680f6b5e4a/Objects?$expand=CALENDRIERs,PHOTOSs,TARIFSs,DESCRIPTIFs&$format=json
// http://api-doc.tourinsoft.com/#/syndication-3x
// https://www.odata.org/documentation/odata-version-3-0/odata-version-3-0-core-protocol/
// 
// http://wcf.tourinsoft.com/Syndication/3.0/cdt71/664d2684-7a2d-440d-ae08-49680f6b5e4a
// http://wcf.tourinsoft.com/Syndication/3.0/cdt71/664d2684-7a2d-440d-ae08-49680f6b5e4a/$metadata
//
// Besoin :
//	SyndicObjectName
//	ADRESSE1 - ADRESSE2 - ADRESSE3 - COMMUNE
//	ObjectTypeName
//	TARIFSs[0].MinimumEuro - MaximumEuro
//	PHOTOSs[0].Photo.url - Titre
//	DESCRIPTIFs[0].Descriptifdelamanifestation
//	CALENDRIERs[0].Datedebut - Heureouvert1 - Datefin - Heurefermeture1
//
const evenements = new Vue({
	el: '#evenements',
	data: {
		events: []
	},
	mounted() {
		expandNames = "CALENDRIERs,PHOTOSs,TARIFSs,DESCRIPTIFs";
		axios.get("http://wcf.tourinsoft.com/Syndication/3.0/cdt71/664d2684-7a2d-440d-ae08-49680f6b5e4a/Objects?$expand=" + expandNames + "&$format=json")
			.then(response => {
					this.events = this.eventsInArray(response.data.value)
					})
			.catch(error => console.log(error))
			.finally(() => {
				
			})
	},
	methods: {
		eventsInArray(allEventsData) {
			
			var eventsData = [];
			var marketData = [];

			// objet evenements
			function eventObject(hour, name, address, commune, type, priceMin, priceMax, photo, bgphoto, photoTitle, desc, dateDeb, dateFin, dateDisplay, horaire) {
				this.hour = hour;	// date de l'event au format unix pour le tri
				this.name = name;
				this.address = address;
				this.commune = commune;
				this.type = type;
				this.priceMin = priceMin;
				this.priceMax = priceMax;
				this.photo = photo;
				this.bgphoto = bgphoto;
				this.photoTitle = photoTitle;
				this.desc = desc;
				this.dateDeb = dateDeb;
				this.dateFin = dateFin;
				this.dateDisplay = dateDisplay;
				this.horaire = horaire;
			}


			// formate la date a afficher sur la fiche
			function formatDate(calendrier) {
				var dateDisplay = '';

				// recurrence
				if(calendrier[0].Reglederecurrence) {
					var regleRecurrence = calendrier[0].Reglederecurrence.split(";");
					var recurrence = regleRecurrence[0].split('=');
					recurrence = recurrence[1]; // WEEKLY, DAILY, MONTHLY ...

					var recurrenceJour = regleRecurrence[1].split('=');
					recurrenceJour = recurrenceJour[1]; // MO TU WE TH FI SA SU ...
					recurrenceJour = recurrenceJour.split(',');
					var m = '';
					if(recurrenceJour.length > 1) {
						for (var i = 0; i < recurrenceJour.length; i++) {
							m = moment(recurrenceJour[i], 'dd', 'en');
							recurrenceJour[i] = m.locale('fr').format('dddd') + "s"; // jour de recurence en Français
						}
						recurrenceJour = recurrenceJour.join(', ');
					} else {
						m = moment(recurrenceJour[0], 'dd', 'en');
						recurrenceJour = m.locale('fr').format('dddd') + "s"; // jour de recurence en Français
					}

					var recurrenceHeureFin = '';
					var recurrenceHeureDeb = moment(calendrier[0].Heureouvert1, '[PT]hh[H]mm[M]').format('HH[h]mm');
					if(calendrier[0].Heurefermeture1) {
						recurrenceHeureFin = moment(calendrier[0].Heurefermeture1, '[PT]hh[H]mm[M]').format('HH[h]mm');
					}
					
					switch (recurrence) {
						case 'WEEKLY':
							dateDisplay = "Tous les ";
							break;
						case 'DAILY':
							dateDisplay = "Tous les jours,";
							break;
						case 'MONTHLY':
							dateDisplay = "Tous les mois,";
					}

					dateDisplay += recurrenceJour;

					return dateDisplay;
				}

				return dateDisplay;

			}


			for (var i = 0; i < allEventsData.length; i++) {

				var event_name = allEventsData[i].SyndicObjectName;
				var event_adress = allEventsData[i].ADRESSE1;
				var event_commune = allEventsData[i].COMMUNE;
				var event_type = allEventsData[i].ObjectTypeName;

				var event_priceMin = '';
				var event_priceMax = '';
				if(allEventsData[i].TARIFSs.length) {
					event_priceMin = allEventsData[i].TARIFSs[0].MinimumEuro;
					event_priceMax = allEventsData[i].TARIFSs[0].MaximumEuro;
				}

				var event_photo = '';
				var event_photoTitle = '';
				if(allEventsData[i].PHOTOSs.length) {
					event_photo = allEventsData[i].PHOTOSs[0].Photo.Url;
					event_bgphoto = "background: url(" + allEventsData[i].PHOTOSs[0].Photo.Url + ")";
					event_photoTitle = allEventsData[i].PHOTOSs[0].Photo.Titre;
				}

				var event_desc = '';
				if(allEventsData[i].DESCRIPTIFs.length) {
					event_desc = allEventsData[i].DESCRIPTIFs[0].Descriptifdelamanifestation;
				}

				var event_hour = '';
				var event_dateDeb = '';
				var event_dateFin = '';
				var event_horaire = '';
				var event_dateDisplay = '';
				if(allEventsData[i].CALENDRIERs.length) {

					if(allEventsData[i].CALENDRIERs.length > 1) {
						event_dateDisplay = formatDate(allEventsData[i].CALENDRIERs);
					}

					event_dateDeb = moment(allEventsData[i].CALENDRIERs[0].Datedebut).format('dddd DD MMMM');
					event_hour = moment(allEventsData[i].CALENDRIERs[0].Datedebut).unix();

					if(!event_dateDisplay) { event_dateDisplay = event_dateDeb };

					if(allEventsData[i].CALENDRIERs[0].Datedebut != allEventsData[i].CALENDRIERs[0].Datefin) {
						event_dateFin = moment(allEventsData[i].CALENDRIERs[0].Datefin).format('dddd DD MMMM');
					}
					if(allEventsData[i].CALENDRIERs[0].Heureouvert1) {
						event_horaire = moment(allEventsData[i].CALENDRIERs[0].Heureouvert1, '[PT]hh[H]mm[M]').format('HH[h]mm');
					}
				}

				var eventData = new eventObject(
						event_hour,
						event_name,
						event_adress,
						event_commune,
						event_type,
						event_priceMin,
						event_priceMax,
						event_photo,
						event_bgphoto,
						event_photoTitle,
						event_desc,
						event_dateDeb,
						event_dateFin,
						event_dateDisplay,
						event_horaire
					);


				if(eventData.name.includes("Marché")) {
					marketData.push(eventData);
				} else {
					eventsData.push(eventData);
				}

			}

			// tri selon date, fallback sur le titre
			eventsData.sort((a, b) => (a.hour > b.hour) ? 1 : (a.hour === b.hour) ? ((a.name > b.name) ? 1 : -1) : -1 );
			marketData.sort((a, b) => (a.hour > b.hour) ? 1 : (a.hour === b.hour) ? ((a.name > b.name) ? 1 : -1) : -1 );

			return eventsData;

		}

	}

})