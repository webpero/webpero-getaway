/*
 *	Ferieplanlegger React - Versjon 0.9.1
 *	15.11.2017: Per Olav Mariussen
 *
 */
 
import React, { Component } from 'react';
import { compose, withProps } from "recompose"
import $ from 'jquery';
import { Navbar, Jumbotron, Button } from 'react-bootstrap';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

import './App.css';

/* Key for webpero github & webpero heroku */
const googleKey = "AIzaSyAL58Of35Vjc2CeUAbSPXc1zd1ugUmYL4Q";

/* 
	Komponent for Google Maps: react-google-maps
	https://tomchentw.github.io/react-google-maps
*/
const MyMap = 
	compose(
		withProps({
			googleMapURL: "https://maps.googleapis.com/maps/api/js?key="+googleKey+"&v=3.exp&libraries=geometry",
			loadingElement: <div style={{ height: `100%` }} />,
			containerElement: <div style={{ height: `400px`, width: `468px` }} />,
			mapElement: <div style={{ height: `100%` }} />
		}),
		withScriptjs,
		withGoogleMap
	)((props) => 
		<GoogleMap
			zoom={props.zoom}
			ref={(map) => map && map.panTo(props.center)} 
		>
			{props.isMarkerShown && <Marker position={props.center} onClick={props.onMarkerClick} />}
		</GoogleMap>
	);


/* Komponent for brukerinput (søk) */
class InputForm extends Component {
	render(){
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
		ev.preventDefault();
		let query = this._query;
		this.props.getInfo(query.value);
		this.props.getVaer(query.value);
		this.props.getPos(query.value);
	}
}

/* Komponent for visning av info om angitt sted (sendes via props) */
class Info extends Component 
{
	render() {
		$("#heading").html(this.props.heading);
		return(
			<p><a href={this.props.infoUrl} target='_blank'><img id='image' src={this.props.picUrl} alt={this.props.heading} /></a></p>
			<p>{this.props.text}</p>
		);
	}
}

/* Komponent for visning av varsel fra Yr */
class Vaer extends Component 
{
	render() {
		if ( this.props.url !== undefined && this.props.url.length > 2 ) {
			return( 
				<iframe id="yr" title="yr" src={this.props.url+'ekstern_boks_tre_dager.html'} width="468" height="290" frameBorder="0" scrolling="no"></iframe>
			);
		} else {
			return(
				<p></p>
			);
		}
	}
}

/* Komponent for visning av sted på kartet */
class Kart extends React.PureComponent
{
  _handleMarkerClick = () => {
  }

  render() {
    return (
      <MyMap
        isMarkerShownPos={this.props.pos !== {}}
		zoom={this.props.zoom}
		center={this.props.pos}
        onMarkerClick={this._handleMarkerClick}
      />
    )
  }
}

/* Selve applikasjonen (eksporteres) */
class App extends Component {

	constructor() {
		super();
		this.state = {
			info: {
				heading: "",
				text: "",
				picUrl: "",
				infoUrl: ""
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
						<Info heading={this.state.info.heading} text={this.state.info.text} picUrl={this.state.info.picUrl} infoUrl={this.state.info.infoUrl} />
					</div>
				</div>  	
			</div>
		);
	}
  
	/* Utfør søk etter info om sted (query) og lagre data i state */
	_getInfo( query ) 
	{
		let res = {},
			info = {};
			
		$.ajax({
			url: 'https://www.googleapis.com/customsearch/v1',
			dataType: "jsonp",
			data: {	
				q: query,											// Søkestrengen
				cx: '018034702328520342012:y80oci2ue2i',			// CSE: webpero-getaway 
				key: googleKey,						
				num: 1
			},
			success: (response) => {
				if ( response.error !== undefined ) {
					// HTTP-response er 200, men det har oppstått feil
					console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
				}
				else {
					if( response.searchInformation !== undefined && response.searchInformation.totalResults > 0 ) {
						/* Minst ett treff, gå igjennom resultatene og sjekk om nødvendige data finnes før de legges inn i data-tabellen */
						if ( response.items[0] !== undefined ) {
							res = response.items[0];
							if ( res.pagemap !== undefined && res.pagemap.cse_image !== undefined  ) {
								/* Nødvendige data finnes i resultat-elementet (res) */
								info.heading = res.title;
								info.text = res.snippet;
								info.picUrl = res.pagemap.cse_image[0].src;
								info.infoUrl = res.formattedUrl;
								this.setState({ info });
							}
						}
					}
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
				key: googleKey,						
				num: 1												// Hent bare ett treff
			},
			success: (response) => {
				if ( response.error !== undefined ) {
					// HTTP-response er 200, men det har oppstått feil
					console.log("Error: "+(response.error !== undefined ? response.error.errors[0].reason : "Ukjent feil!") );
				}
				else {
					if( response.searchInformation !== undefined && response.searchInformation.totalResults > 0 ) {
						/* Minst ett treff, gå igjennom resultatene og sjekk om nødvendige bildedata finnes før de legges inn i data-tabellen */
						if ( response.items[0] !== undefined ) {
							res = response.items[0];
							if ( res.pagemap !== undefined && res.pagemap.metatags[0] !== undefined ) {
								/* Hent ut URL til aktuelt sted */
								vaer.url = res.pagemap.metatags[0]["lp:url"];
								this.setState({ vaer });
							}
						}
					}
				}
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
				key: googleKey,						
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