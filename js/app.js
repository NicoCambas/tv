// Initialisation des librairies
moment().format();
moment.locale('fr');

Vue.component('ephemerides', {
	data: function () {
		return {
			dateDuJour: '',
			saintDuJour: '',
			soleilLever: '',
			soleilCoucher: ''
		}
	},
	template:
		`<div id="ephemeride" v-cloak>
			<div id="datedujour">{{ dateDuJour }}</div>
			<div id="saintdujour">{{ saintDuJour }}</div>
			<div id="soleildujour">
				<i class="wi wi-sunrise soleilLeverIcon"></i><div class="soleilLever">{{ soleilLever }}</div>
				<i class="wi wi-sunset soleilCoucherIcon"></i><div class="soleilCoucher">{{ soleilCoucher }}</div>
			</div>
		</div>`
})

const rightColumn = new Vue({
	el: '#rightColumn',
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
