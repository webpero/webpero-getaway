import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class App extends Component {
  render() {
    return (
		<div className="container margin-top">
		
			<div className="row">
				<div className="col-lg-5">
					<h2>Hvor vil du dra?</h2>
				</div>
				<div className="col-lg-7">
					<h2 id="heading"></h2>
					<InputForm />
				</div>
			</div>
			
			<div className="row">
				<div className="col-lg-5">
					<div id="map">
					</div>
					<div id="yr"></div>
				</div>
				
				<div className="col-lg-7">
					<FerieInfo />
				</div>

			</div>
		</div>
    );
  }
}

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
	}
}

/* Komonent for uthenting og visning av ferieinfo om angitt sted */
class FerieInfo extends Component {
	
	constructor() {
		super();
		this.state = {
			info: {
				heading: "",
				text: "",
				picUrl: "",
				infoUrl: ""
			}
		};
	}

	render() {
		return(
			<p>
				<a href={this.state.info.infoUrl} target='_blank'><img id='image' src={this.state.info.picUrl} alt={this.state.info.heading} /></a><br/>
				{this.state.info.text}
			</p>
		);
	}
	
	_getFerieInfo(query) {
		let res = {},
			info = {};
			
		$.ajax({
			url: 'https://www.googleapis.com/customsearch/v1',
			dataType: "jsonp",
			data: {	
				q: query,											// Søkestrengen
				cx: '018034702328520342012:y80oci2ue2i',			// CSE: webpero-getaway 
				/*key: 'AIzaSyAL58Of35Vjc2CeUAbSPXc1zd1ugUmYL4Q',	// Google API-key for github&heroku */
				key: 'AIzaSyCUb7lLbMRJkweAbcXiS3ejObHqnlDkKOQ',		// Google API-key for test				
				num: 1
			},
			success: function(response) {
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
}

ReactDOM.render(<App />, document.getElementById('app'));