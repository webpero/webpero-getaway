/*
 *	Komponent for visning av info og bilde for et angitt sted
 *	01.12.2017: Per Olav Mariussen
 * 
 *  Props:
 *  	info: {
 *			index: number,
 *			count: number,
 * 			content: [{
 *				heading: string,
 *				text: string,
 *				picUrl: string,
 *				infoUrl: string
 *			}]
 *		}
 *
 */
 
import React, { Component } from 'react';
import $ from 'jquery';

/* Komponent for visning av info om angitt sted (sendes via props) */
class Info extends Component
{
	constructor(props) {
		super(props);
		this._handleClickForrige = this._handleClickForrige.bind(this);
		this._handleClickNeste = this._handleClickNeste.bind(this);
	}

	/* Beregn ny index når bruker klikker på forrige */
	_handleClickForrige(ev) {
		let index = this.props.info.index - 1;
		ev.preventDefault();
		if ( index < 0 ) {
			index = this.props.info.count - 1;
		}
		this.props.onIndexChange(index);	//Send ny index opp til parent
	}
	/* Beregn ny index når bruker klikker på neste */
	_handleClickNeste(ev) {
		let index = this.props.info.index + 1;
		ev.preventDefault();
		if ( index >= this.props.info.count ) {
			index = 0;
		}
		this.props.onIndexChange(index); //Send ny index opp til parent
	}	
	
	render() {
		const el = this.props.info.content[this.props.info.index]; 	//Info som skal vises settes lik aktuelt element fra content-tabellen
		
		$("#heading").html(el.heading);	
		return(
			<div>
				{ el.picUrl.length > 0 &&
					<div>
						<p>
							<button className='btn btn-default btn-md' onClick={this._handleClickForrige}><span className='glyphicon glyphicon-chevron-left'></span>&nbsp;Forrige</button>
							<button className='btn btn-default btn-md' onClick={this._handleClickNeste}>Neste&nbsp;<span className='glyphicon glyphicon-chevron-right'></span></button>
						</p>
						<p><a href={el.infoUrl} target='_blank'><img id='image' src={el.picUrl} alt={el.heading} /></a></p>
						<p>{el.text}</p>
					</div>
				}
			</div>
		);
	}
}

export default Info;