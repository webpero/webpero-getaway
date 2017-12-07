/*
 *	Ferieplanlegger React - Versjon 0.9.6
 *	01.12.2017: Per Olav Mariussen
 *
 */
 
import React, { Component } from 'react';
import $ from 'jquery';

import webpero from './webpero.js';
import Info from './Info.js';
import Kart from './map.js';
import Vaer from './Vaer.js';

import './App.css';

/* Komponent for brukerinput (søk) */
class InputForm extends Component 
{
	render() {
		return(
			<form className="form" id="query-form" onSubmit={this._handleSubmit.bind(this)}>
				<div className="form-group">
					<input type="text" placeholder="Sted/by" size="40" ref={(input) => this._query = input}/>
					<button id="submit" className='btn btn-primary btn-md'>getaway&nbsp;<span className='glyphicon glyphicon-chevron-right'></span></button>
				</div>
			</form>
		);
	}
	
	_handleSubmit(ev) {
		let query = this._query;
		ev.preventDefault();
		this.props.getInfo(query.value);
		this.props.getVaer(query.value);
		this.props.getPos(query.value);
	}
}

/* Selve applikasjonen (eksporteres) */
class App extends Component 
{
	constructor() {
		super();
		this.state = {
			info: {
				count: 0,
				index: 0,
				content: [{
					heading: "",
					text: "",
					picUrl: "",
					infoUrl: ""
				}]
			},
			vaer: {
				url: ""
			},
			kart: {
				pos: {lat:59.913, lng:10.752},	// Oslo
				zoom: 4,
				text: ""
			}
		};
	}
	
	/* Sett index på aktuelt element i info-array */
	_changeIndex( index ) {
		let info = this.state.info;
		info.index = index;
		this.setState( {info} );
	}
	
	render() {
		return (
			<div className="container margin-top">
				<div className="row">
					<div className="col-lg-5">
						<h2>Hvor vil du dra?</h2>
						<InputForm getInfo={this._getInfo.bind(this)} getVaer={this._getVaer.bind(this)} getPos={this._getPos.bind(this)} />
					</div>
					<div className="col-lg-7">
						<h2 id="heading"></h2>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-5">
						<Kart pos={this.state.kart.pos} zoom={this.state.kart.zoom} text={this.state.kart.text} />
						<Vaer url={this.state.vaer.url} />
					</div>
					<div className="col-lg-7">
						<Info info={this.state.info} onIndexChange={this._changeIndex.bind(this)} />
					</div>
				</div>  	
			</div>
		);
	}
  
	/* Utfør søk etter info om sted (query) og lagre data i state */
	_getInfo( query ) 
	{
		let res = {},
			info = { 
				count: 0,
				index: 0,
				content: []
			},
			el;
			
		$.ajax({
			url: 'https://www.googleapis.com/customsearch/v1',
			dataType: "jsonp",
			data: {	
				q: query,											// Søkestrengen
				cx: '018034702328520342012:y80oci2ue2i',			// CSE: webpero-getaway 
				key: webpero.googleKey(),						
				num: 10
			},
			success: (response) => {
				if ( response.error !== undefined ) {
					// HTTP-response er 200, men det har oppstått feil
					console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
				}
				else {
					if( response.searchInformation !== undefined && response.searchInformation.totalResults > 0 ) {
						/* Minst ett treff, gå igjennom resultatene og sjekk om nødvendige data finnes før de legges inn i data-tabellen */
						for ( var i = 0; i < 10; i++ ) {
							if ( response.items[i] !== undefined ) {
								res = response.items[i];
								if ( res.pagemap !== undefined && res.pagemap.cse_image !== undefined  ) {
									/* Nødvendige data finnes i resultat-elementet (res) */
									el = {};
									el.heading = res.title;
									el.text = res.snippet;
									el.picUrl = res.pagemap.cse_image[0].src;
									el.infoUrl = res.formattedUrl;
									info.content.push(el);
									info.count++;
								}
							}
						}
					}
					/* Sett info i state. Ingen treff vil blanke ut eventuelle tidligere data */
					this.setState({ info });				
				}
			},
			error: function(response) {
				console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
			}
		});		
	}  
	
	/* 	Søk etter værdata på yr for sted (query) og lagre data i state */
	_getVaer( query ) 
	{
		let res = {},
			vaer = {};

		$.ajax({
			url: 'https://www.googleapis.com/customsearch/v1',
			dataType: "jsonp",
			data: {	
				q: query,											// Søkestrengen (sted)
				cx: '018034702328520342012:701p_fuzpji',			// CSE: webpero-ferieplanlegger-yr
				key: webpero.googleKey(),						
				num: 1												// Hent bare ett treff
			},
			success: (response) => {
				if ( response.error !== undefined ) {
					// HTTP-response er 200, men det har oppstått feil
					console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
				}
				else {
					if( response.searchInformation !== undefined && response.searchInformation.totalResults > 0 ) {
						/* Ett treff, sjekk om nødvendige data finnes før de legges inn */
						if ( response.items[0] !== undefined ) {
							res = response.items[0];
							if ( res.pagemap !== undefined && res.pagemap.metatags[0] !== undefined ) {
								/* Hent ut URL til aktuelt sted */
								vaer.url = res.pagemap.metatags[0]["lp:url"];
							}
						}
					}
					/* Sett info i state. Ingen treff vil blanke ut eventuelle tidligere data */
					this.setState({ vaer });				}
			},
			error: function(response) {
				console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
			}
		});
	}
	
	/* Hent GPS-poisjon med Google Geolocation API for angit sted (query) */
	_getPos( query ) 
	{
		let kart = {};

		$.ajax({
			url: 'https://maps.googleapis.com/maps/api/geocode/json',
			data: {	
				address: query,
				key: webpero.googleLocKey(),						
			},
			success: (response) => {
				if ( response.results[0] !== undefined ) {
					kart.text = response.results[0].formatted_address;
					kart.pos = response.results[0].geometry.location;
					kart.zoom = 10;
					this.setState({ kart });
				}
			},
			error: function(response) {
				console.log("Error: "+(response.error_message !== undefined ? response.error_message : "Ukjent feil!") );
			}
		});
	}
}

export default App;