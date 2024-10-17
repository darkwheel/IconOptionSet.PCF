import {IInputs, IOutputs} from "./generated/ManifestTypes";
import  IconOptionsetControl, {IIconOptionsetProps, IIconSetup } from "./IconOptionsetControl";
import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';
import {OptionsetIcons} from "./OptionsetIcons";



export class IconOptionset implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _root: Root;
	private _selected: number | undefined;
	private _notifyOutputChanged:() => void;
	private _props: IIconOptionsetProps = { selected: undefined, 
								icons: [],
								readonly:false,
								masked:false,							
								selectedcolor:"", 
								onChange : this.notifyChange.bind(this) };
	
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{

		// Add control initialization code
		this._notifyOutputChanged = notifyOutputChanged;
		this._root = createRoot(container!)
	}

	notifyChange(selected: number|undefined) {
		
		this._selected = selected;
		this._notifyOutputChanged();
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{

		// If the form is diabled because it is inactive or the user doesn't have access
		// isControlDisabled is set to true
		let isReadOnly = context.mode.isControlDisabled;

		let isMasked = false;
		// When a field has FLS enabled, the security property on the attribute parameter is set
		if (context.parameters.optionset.security) {
			isReadOnly = isReadOnly || !context.parameters.optionset.security.editable;
			isMasked =  !context.parameters.optionset.security.readable
		}

		if(context.parameters.optionset.attributes == null){
			return;
		}

		

		this._selected = context.parameters.optionset.raw !== null ? context.parameters.optionset.raw : undefined;

		let options:ComponentFramework.PropertyHelper.OptionMetadata[] 
				= context.parameters.optionset.attributes.Options;

		//Prepare Props for React Component
		this._props.selected = this._selected;
		this._props.icons = options.map((option,index)=>this.getIconSetup(option));
		this._props.selectedcolor = context.parameters.selectedcolor.raw || "";
		this._props.readonly = isReadOnly;
		this._props.masked = isMasked;

		// RENDER React Component
		this._root.render(createElement(IconOptionsetControl, this._props)) 

	}
	
		

	private getIconSetup(option:ComponentFramework.PropertyHelper.OptionMetadata) : IIconSetup
	{
		const icon = OptionsetIcons[option.Value]?? "Group";
		return {key:option.Value,icon:icon,text:option.Label};
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			optionset: this._selected
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._root.unmount();
	}
}