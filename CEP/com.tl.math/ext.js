/*************************************************************************
* tl math plugin and CEP
*thomas laforge  Copyright 2020
**************************************************************************/
/**
 * load panel function when opening. Also contain event listener
 * input : void
 * return void
 */
function onLoaded() {
	var pluginName = "tlMath";
	var pluginVersion =115;
	var csInterface = new CSInterface();
	var appName = csInterface.hostEnvironment.appName;
	csInterface.setWindowTitle = "tl Math Setup";
	var numParams =10;
	var err = defineErr();
    //prepare settings GUI
	setParamsSettings("slider", numParams, 1, "sliderGrp");
	setParamsSettings("point", numParams, 3, "pointGrp");
	setParamsSettings("cbox", numParams, 1, "cboxGrp");
	setParamsSettings("color", numParams, 3, "colorGrp");
	setParamsSettings("rotation", numParams, 1, "rotationGrp");
	loadJSX(); //load jsx scripts to communicate with AE
	sendMessageToPlugin();	 //if plugin is selected tell us the panel is opened
	defaultVal(); //load default ddl val
	var editors = setEditors(); // set ace.js editors
	//laod default arb
	var arbdefaultStr = loadDefaultArb(); 
	var arbData = JSON.parse(arbdefaultStr); 
	try{
		copyDataToGUI (arbData, editors,numParams);
	}catch(e){
		alert(e)
	}
	
	//presets loading
	var presetsList;
	csInterface.addEventListener("tlmath.preset", function(fromPresetEvent){
		presetsList = fromPresetEvent.data;
		updatePresetMenu (presetsList, editors);
	});
	
	loadPluginPresets(arbData);
    
	//evt listener from plugin
	csInterface.addEventListener("tlmath.arbSentfromPlugin", function(fromArbEvent) {
			try{
				dataStr =JSON.stringify(fromArbEvent.data);
				var newArbData = JSON.parse(dataStr); //fromArbEvent.data;
				if (fromArbEvent.data.effectInfo.effectName !=pluginName) {alert (err.PresetFile); return};
				arbData = newArbData;
			}catch(e){
				alert ("error in copy from plugin: "+e)
				return;
			}
			try{
				copyDataToGUI (arbData, editors,numParams);
				langSelecFunc();
			}catch(e){
				alert("error in data to copy "+e)
			}
	});
	csInterface.addEventListener("tlmath.arbSentfromPreset", function(fromArbEvent){
		if (fromArbEvent.data.effectInfo.effectName !=pluginName) {alert (err.PresetFile); return};
		if (parseInt(pluginVersion)<parseInt(fromArbEvent.data.effectInfo.minimalPluginVersion)) {alert (err.pluginVersion); return}
			arbData = fromArbEvent.data;
			try{
				copyDataToGUI (arbData, editors,numParams);
			}catch(e){
				alert(e)
			} 
		});
	$("#seachBarInput").on("keyup", function(){
		var filter = $("#seachBarInput").val().toUpperCase();
		var list = document.getElementsByClassName ("presetsBlock");
		for (var i=0; i<list.length; i++){
			var foundB = false;
			for (var j=0; j<presetsList.preset[i].tags.length; j++){
				if (presetsList.preset[i].tags[j].toUpperCase().indexOf(filter) >-1){
					foundB = true;
					break;
				}
			}
			if (foundB == true ){
				list[i].style.display ="";
			}else{
				list[i].style.display ="none";
				}
			}
		});
	$("#presetsListAccess").on("change", function(){
		var  presetSelectedIndex = $('input[name="presetListRb"]:checked').val();
		var inputStr =  presetsList.preset[presetSelectedIndex].description.toString().replace("\\n", "<br>");
		var descriptionStr = "Description : <br> "+cleanJsonFromArbStr(inputStr);
		$("#presetDescr").html(descriptionStr);
		});
	$("#btnLoad").on("click", function() {		
		loadPresetJSONFile();
		});
	$("#btnExport").on("click", function() {
		try{
			var arbDataToSend = copyDataFromGUI(editors, arbData,numParams);	
			exportPresetAsJSON(arbDataToSend);
		}catch(e){
			alert(err.collectingDataForPlugin+e);
			}
		});
	$("#btnSavePreset").on("click", function() {
		var arbDataToSend = copyDataFromGUI(editors, arbData,numParams);		
		savePresetAsJSON(arbDataToSend);
		csInterface.evalScript('$._ext.listJsonFiles('+objDataStr+')'); //reupdate list
		});
	$("#btnLoadPresetFromMenu").on("click", function(){
		loadPresetFromMenu(presetsList, editors,numParams);
		langSelecFunc();
		//force to open editor if not yet
		var presetsMenu = document.getElementById("tabEditsMenu");
		if (presetsMenu.style.display === "none"){
			presetsMenu.style.display = "block";
			$('#SettingsCol').css("width",  290);
			}
	});
	$("#btnLoadAndApplyPresetFromMenu").on("click", function(){
		loadPresetFromMenu(presetsList, editors,numParams);
		langSelecFunc();
		try{
			var arbDataToSend = copyDataFromGUI(editors, arbData, numParams);
			}catch(e){
				alert(err.collectingDataForPlugin+e);
			}
		if (arbDataToSend){
			var arbDataStr = JSON.stringify(arbDataToSend);
			try{
				evalScript("$._ext.sendDataToPlugin("+arbDataStr+")");
			}catch(e){
				alert (err.exportToPlugin+e)
				}
			}

	});
	$("#btnApply").on("click", function() {
		try{
			var arbDataToSend = copyDataFromGUI(editors, arbData, numParams);
			}catch(e){
				alert(err.collectingDataForPlugin+e);
			}
		if (arbDataToSend){
			var arbDataStr = JSON.stringify(arbDataToSend);
			try{
				evalScript("$._ext.sendDataToPlugin("+arbDataStr+")");
			}catch(e){
				alert (err.exportToPlugin+e)
				}
			}
		
		});
	$('#split-bar').mousedown(function (e) {
		e.preventDefault();
		$(document).mousemove(function (e) {
			e.preventDefault();
			var x = e.pageX - $('#SettingsCol').offset().left;
			if (x>70){
				$('#SettingsCol').css("width", x);
				resizeEditorsMarginLeft(x+$('#SettingsCol').offset().left);
			}
		})
	});
	$(document).mouseup(function (e) {
		$(document).unbind('mousemove');
	});
	}
	$("#search").on("click", function() {
		editor.execCommand("find");
	});
	$("#btnreplace").on("click", function() {
		editor.execCommand("replace");
	});

/**
 * send a messag to plugin (if selected)
 * input : void
 * return void
 */
function sendMessageToPlugin(){
	evalScript("$._ext.sendMessageToPlugin()");
	}
/**
 * create object with error warnings
 * input : void
 * return  object err
 */
function defineErr(){
	var err = {};
	err.PresetFile = "Error: the tlMath Preset is not recognized";
	err.pluginVersion ="Error: the plugin Version is not compatible with this preset";
	err.selectPreset = "Please, select a preset";
	err.exportToPlugin = "error exporting from panel to plugin: ";
	err.collectingDataForPlugin ="error collecting data for plugin: ";
	return err;
	}
/**
 * update the preset menu with info from a preset list. append direct to html
 * input : obj presetList with presetList.preset[] array containing the data
 * return  void
 */
function updatePresetMenu (presetsList){
	for (var i =0; i< presetsList.preset.length; i++){
		var inputStr = '<label  id="'+presetsList.preset[i].name+'"  class="presetsBlock">'+
		'<input type="radio" class="presetIconRadio" id="presetIconRadio'+i+'" name="presetListRb" value="'+i+'" />'+
		'<img src="'+presetsList.preset[i].icon+'" class="presetIconImgsId">'+presetsList.preset[i].name+
		'</label>';
		$("#presetsListAccess").append(inputStr);
		}
	}
/**
 * copy data from preset file to panel GUI
 * input : (obj presetList, obj editors, int num params)
 * return  void
 */
function loadPresetFromMenu(presetsList, editors, numParams){
	var selectedPreset = parseInt($("input[name='presetListRb']:checked").val());
	if (typeof(selectedPreset) === "undefined"){
		alert (err.selectPreset);
		return
		}
	var jsonDataObj = JSON.parse(presetsList.preset[selectedPreset].str);
	try{
		copyDataToGUI (jsonDataObj,  editors, numParams);
	}catch(e){
		alert (e)
		}
	}
/**
 * call jsx function to load a json preset file
 * input : void
 * return  void
 */
function loadPresetJSONFile(){
	 evalScript("$._ext.loadJSONFile()");
	}
/**
 * stringify arbData and call jsx to export json
 * input : obj arbdata
 * return  void
 */
function exportPresetAsJSON(arbDataToSend){
	if (arbDataToSend){
		var arbDataStr = JSON.stringify(arbDataToSend);
		evalScript("$._ext.exportPresetFile("+arbDataStr+")");
		}
	}
/**
 * stringify arbData and call jsx to export json in  preset folder
 * input : obj arbdata
 * return  void
 */
function savePresetAsJSON(arbDataToSend){
	if (arbDataToSend){
		var arbDataStr = JSON.stringify(arbDataToSend);
		evalScript("$._ext.exportPresetFileToUserLib("+arbDataStr+")");
		}
	}
/**
 * clean json str  replace \ by double \
 * input : str
 * return str
 */
function cleanJsonToArbStr (str){
	str = str.replace(/\n/g, "\\n")
               .replace(/\"/g, '\\"')
               .replace(/\r/g, "\\r")
               .replace(/\t/g, "\\t")
			   .replace(/\f/g, "\\f");
			   //.replace(/\'/g, "\\' ")

    return str;
	}
/**
 * clean json str  replace double\ by  \
 * input : str
 * return str
 */
function cleanJsonFromArbStr (str){
	str = str.replace(/\\n/g, "\n")
               .replace(/\\"/g, '\"')
               .replace(/\\r/g, "\r")
               .replace(/\\t/g, "\t")
			   .replace(/\\f/g, "\f");
			   //.replace(/\\'/g, "\'")

    return str;
	}
/**
 * structure console text
 * input : str consoleName, str repport (repport to print on console)
 * return  str nexStr (for the console)
 */
function setConsoleStr (consoleName, strRepport){
	var newStr = consoleName.toString()+"<br/>"+ cleanJsonFromArbStr(strRepport).replace("\\n", "<br/>");
	return newStr
	}
/**
 * set flags from shaders str 
 * input : obj arbdata, array strArr (with strings to find)
 * return  bool boolResultB
 */
function setflagFromGL (arbData, strArr){
	var boolResultB = false;
	for (var i =0; i<strArr.length; i++){
		if (arbData.gl_expression.gl33_frag_sh.indexOf(strArr[i]) !=-1 ||
		arbData.gl_expression.gl33_vert_sh.indexOf(strArr[i]) !=-1){
			boolResultB = true;
		} 
	}
	return boolResultB;
	}
/**
 * set flags from expr str 
 * input : obj arbdata, array strArr (with strings to find)
 * return  bool boolResultB
 */
function setflagFromExpr(arbData, strArr){
	var boolResultB = false;
	for (var i =0; i<strArr.length; i++){
		if (arbData.math_expression.alphaExpr.indexOf(strArr[i]) !=-1){
			boolResultB = true;
			return boolResultB;
		}
		if (arbData.math_expression.commonExpr.indexOf(strArr[i]) !=-1){
			boolResultB = true;
			return boolResultB;
		}
		if (arbData.math_expression.exprRGBModeB &&
			arbData.math_expression.rgbExpr.indexOf(strArr[i]) !=-1){
				boolResultB = true;
				return boolResultB;
			}
		else if (arbData.math_expression.redExpr.indexOf(strArr[i]) !=-1 ||
			arbData.math_expression.greenExpr.indexOf(strArr[i]) !=-1||
			arbData.math_expression.blueExpr.indexOf(strArr[i]) !=-1){
				boolResultB = true;
				return boolResultB;
			}

	} 

	return boolResultB;
	}
/**
 * setParamsSettings :create param settings GUI 
 * input : str ParamName, int numParams (number of parameters), int paramDimension (dimension of the parameter in AE),  paramGroupId (id of the group of parameter) 
 * return  void
 */
function setParamsSettings(paramName, numParams, paramDimension, paramGroupId){
	var grp = document.getElementById(paramGroupId);
	var paramGrpStr = '<th>Parameter</th> \n'+
	'<th>Visible</th>\n'+
		'<th>GUI Name</th>\n'+
		'<th>default value</th>\n'+
		'<tr>'+
		'<td>'+paramName+' Group</td> \n'+
		'<td><input type="checkbox" name="'+paramName+'GrpVisible" id="'+paramName+'GrpVisible"'+
		'onClick= "toggleCheckbox(\'cb'+paramName+'\', \''+paramName+'GrpVisible\')" checked ></td> \n'+
		'<td><input type="text"   id="'+paramName+'GrpName" value="'+paramName+'Grp" maxlength="31"></td> \n'+
		'</tr> \n';
	grp.innerHTML =paramGrpStr;
	strGrp ="";
	for (var i=0; i<numParams; i++){
		var indexName = i+1;
		var paramStr ='<tr>'+
			'<td>'+paramName+' '+indexName+'</td> \n'+
			'<td ><input type="checkbox" id="'+paramName+i+'_visible"  class="cb'+paramName+'" checked></td> \n'+
			'<td><input type="text" id = "'+paramName+i+'_name" value="'+paramName+indexName+'" maxlength="31" size =10></td> \n'+
			'<td><table>';
		for (var j=0; j<paramDimension; j++){
			paramStr += '<td><input type="text" id = "'+paramName+i+'_defaultVal'+j+'" value="'+j+'" maxlength="10" size=4</td> \n';
		}
		paramStr +='</table></td> \n'+
			'</tr> \n'
		strGrp+=paramStr;
		}
		grp.innerHTML +=strGrp;
	}
/**
 * getParamsSettings :catch the param settings values  from the arbData and  store it into the GUI
 * input : obj arbData (to read the data), int numParams (number of parameter to updated), int paramDimension (dimension of the parameter), paramGroupId (id of the group of parameter) 
 * return  void
 */
function getParamsSettings(arbData, paramName, numParams, paramDimension, paramGroupId){
	$("#"+paramName+"GrpName").val(arbData.gui_settings[paramGroupId].grpName.toString());
	$("input[name="+paramName+"GrpVisible]").prop('checked', arbData.gui_settings[paramGroupId].grpVisibleB);
	for (var i=0; i<numParams; i++){
		$("#"+paramName+i+"_name").val(arbData.gui_settings[paramGroupId].params[i].name.toString());
		$("input[id="+paramName+i+"_visible]").prop('checked', arbData.gui_settings[paramGroupId].params[i].visibleB);
		for (var j=0; j<paramDimension; j++){
			$("#"+paramName+i+'_defaultVal'+j).val(parseFloat(arbData.gui_settings[paramGroupId].params[i].defaultVal[j]));
			}
		}
	}
/**
 * sendParamsSettings :c atch the param settings value from the GUI
 * input : obj arbData (to returned updated), int numParams (number of parameter to updated), int paramDimension (dimension of the parameter), paramGroupId (id of the group of parameter) 
 * return : arbData (updated with new parameters settings)
 */
function sendParamsSettings(arbData, paramName, numParams, paramDimension, paramGroupId){
	arbData.gui_settings[paramGroupId].grpName =safeCharsForName ($("#"+paramName+"GrpName").val().toString());	
	arbData.gui_settings[paramGroupId].grpVisibleB =$("#"+paramName+"GrpVisible").is(':checked');
	
	for (var i=0; i<numParams; i++){
		arbData.gui_settings[paramGroupId].params[i].name =safeCharsForName ($("#"+paramName+i+"_name").val().toString());
		arbData.gui_settings[paramGroupId].params[i].visibleB= $("#"+paramName+i+"_visible").is(':checked');
		for(var j=0; j<paramDimension; j++){
			arbData.gui_settings[paramGroupId].params[i].defaultVal[j]=parseFloat($("#"+paramName+i+'_defaultVal'+j).val());
			}
		}
	return arbData;
}
/**
*  safeCharsForName : delete special chars for parameters Name
*input: string nameStr
*return: string safeName
 */
function safeCharsForName (nameStr){
	var safeNameStr = nameStr.toString().replace(/[^\w\s]/gi, '');
	return safeNameStr
	}
/**
* copyDataToGUI: get data from obj arbData and apply to the GUI using jquery
*input:obj arbData, obj editors, int numParams
*return: void
 */
function copyDataToGUI (arbData, editors, numParams) {
	$("#gl33_frag_tab_console").html(setConsoleStr ("Console - Fragment Shader", arbData.gl_expression.gl33_frag_error.toString()));
	$("#gl33_vert_tab_console").html(setConsoleStr ("Console - Vertex Shader",arbData.gl_expression.gl33_vert_error.toString()));
	$("#expr_red_tab_console").html(setConsoleStr ("Console - Red Channel",arbData.math_expression.red_error.toString()));	
	$("#expr_green_tab_console").html(setConsoleStr ("Console - Green Channel",arbData.math_expression.green_error.toString()));
	$("#expr_blue_tab_console").html(setConsoleStr ("Console - Blue Channel",(arbData.math_expression.blue_error.toString())));
	$("#expr_rgb_tab_console").html(setConsoleStr ("Console - RGB Channels",arbData.math_expression.rgb_error.toString()));
	$("#expr_alpha_tab_console").html(setConsoleStr ("Console - Alpha Channel",arbData.math_expression.alpha_error.toString()));
	$("#expr_common_tab_console").html(setConsoleStr ("Console - Common Channel",arbData.math_expression.common_error.toString()));
	if (arbData.gl_expression.gl33_frag_sh){
		editors.gl33_frag_editor.setValue(cleanJsonFromArbStr(arbData.gl_expression.gl33_frag_sh.toString()), -1);
	}
	if (arbData.gl_expression.gl33_vert_sh){
		editors.gl33_vert_editor.setValue(cleanJsonFromArbStr(arbData.gl_expression.gl33_vert_sh.toString()), -1);
	}
	if (arbData.math_expression.redExpr){
		editors.expr_red_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.redExpr.toString(), -1));
	}
	if (arbData.math_expression.greenExpr){
		editors.expr_green_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.greenExpr.toString(), -1));
	}
	if(arbData.math_expression.blueExpr){
		editors.expr_blue_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.blueExpr.toString(), -1));
	}
	if(arbData.math_expression.rgbExpr){
		editors.expr_rgb_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.rgbExpr.toString(), -1));
	}
	if(arbData.math_expression.alphaExpr){
		editors.expr_alpha_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.alphaExpr.toString(), -1));
	}
	if(arbData.math_expression.commonExpr){
		editors.expr_common_editor.setValue(cleanJsonFromArbStr(arbData.math_expression.commonExpr.toString(), -1));
	}
	$("#presetName").val( cleanJsonFromArbStr(arbData.effectInfo.presetName.toString()));
	$("#descriptionText").val(cleanJsonFromArbStr(arbData.effectInfo.description.toString()));
	$("#presetTags").val(arbData.effectInfo.tags.toString());
	if(arbData.effectMode.gl33_modeB){
		$("#langSelec").val("GLSL"); 
	}
	if(arbData.effectMode.expr_modeB){
		$("#langSelec").val("mExpr");
	}
	toggleRgbModeBox ("rgbmodeB", arbData.math_expression.exprRGBModeB);
	$("#resolutionName").val(arbData.composition.resolution.toString());
	$("#layerPositionName").val(arbData.composition.layerPosition.toString());
	$("#layerScaleName").val(arbData.composition.layerScale.toString());
	$("#compResolutionName").val(arbData.composition.compResolution.toString());
	$("#tsecName").val(arbData.composition.time_sec.toString());
	$("#tframeName").val(arbData.composition.time_frame.toString());
	$("#fpsName").val(arbData.composition.frame_rate.toString());
	$("#camera_pos").val(arbData.composition.camera_position.toString());
	$("#camera_targ").val(arbData.composition.camera_target.toString());
	$("#camera_rot").val(arbData.composition.camera_rotation.toString());
	$("#camera_zoom").val(arbData.composition.camera_zoom.toString());
	$("#expr_current_channelName").val(arbData.math_expression.expr_current_channel.toString());
	$("#expr_rgb_channelName").val(arbData.math_expression.expr_rgb_channel.toString());
	$("#expr_pixName").val(arbData.math_expression.expr_pix.toString());
	getParamsSettings(arbData, "slider", numParams, 1, "sliderGrp");
	
	getParamsSettings(arbData, "point", numParams, 3, "pointGrp");
	getParamsSettings(arbData, "cbox", numParams, 1, "cboxGrp");
	getParamsSettings(arbData, "color", numParams, 3, "colorGrp");
	getParamsSettings(arbData, "rotation", numParams, 1, "rotationGrp");
	$("#layerGrpName").val(arbData.gui_settings.layerGrp.grpName.toString());
	$("input[name=layerGrpVisible]").prop('checked', arbData.gui_settings.layerGrp.grpVisibleB);
	$("#layer00_name").val(arbData.gui_settings.layerGrp.current_layer.name.toString());
	$("#layer01_name").val(arbData.gui_settings.layerGrp.extLayer_1.name.toString());
	$("input[name=layer01Visible]").prop('checked', arbData.gui_settings.layerGrp.extLayer_1.visibleB);
	$("#layer02_name").val(arbData.gui_settings.layerGrp.extLayer_2.name.toString());
	$("input[name=layer02Visible]").prop('checked', arbData.gui_settings.layerGrp.extLayer_2.visibleB);
	$("#layer03_name").val(arbData.gui_settings.layerGrp.extLayer_3.name.toString());
	$("input[name=layer03Visible]").prop('checked', arbData.gui_settings.layerGrp.extLayer_3.visibleB);
	$("#layer04_name").val(arbData.gui_settings.layerGrp.extLayer_4.name.toString());
	$("input[name=layer04Visible]").prop('checked', arbData.gui_settings.layerGrp.extLayer_4.visibleB);
	}
/**
*copyDataFromGUI:  Catch the values from GUI and copy it to obj arbData
*input: obj editors, obj arbData, int numParams
*return: obj arbData (updated)
*/
function copyDataFromGUI (editors, arbData, numParams) {
	var fragLimit = 25000;
	var VertLimit = 25000;
	var exprLimit = 4096;
	var descriptionLimit = 2048;
	//copy  expressions
	if (editors.gl33_frag_editor.getValue().toString().length <fragLimit){
		arbData.gl_expression.gl33_frag_sh = cleanJsonToArbStr((editors.gl33_frag_editor.getValue()).toString());
	}else{
		alert ("Fragment Shader text is tool long");
	}
	if (editors.gl33_vert_editor.getValue().toString().length <VertLimit){
		arbData.gl_expression.gl33_vert_sh = cleanJsonToArbStr(( editors.gl33_vert_editor.getValue()).toString());
	}else{
		alert ("Vertex Shader text is tool long");
	}
	if (editors.expr_red_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.redExpr = cleanJsonToArbStr(( editors.expr_red_editor.getValue()).toString());
	}else{
		alert ("red expression text is tool long");
	}
	if (editors.expr_green_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.greenExpr= cleanJsonToArbStr(( editors.expr_green_editor.getValue()).toString());
	}else{
		alert ("green expression text is tool long");
	}
	if (editors.expr_blue_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.blueExpr= cleanJsonToArbStr(( editors.expr_blue_editor.getValue()).toString());
	}else{
		alert ("blue expression text is tool long");
	}
	if (editors.expr_rgb_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.rgbExpr= cleanJsonToArbStr(( editors.expr_rgb_editor.getValue()).toString());
	}else{
		alert ("rgb expression text is tool long");
	}
	if (editors.expr_alpha_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.alphaExpr= cleanJsonToArbStr(( editors.expr_alpha_editor.getValue()).toString());
	}else{
		alert ("alpha expression text is tool long");
	}
	if (editors.expr_common_editor.getValue().toString().length <exprLimit){
		arbData.math_expression.commonExpr= cleanJsonToArbStr(( editors.expr_common_editor.getValue()).toString());
	}else{
		alert ("common expression text is tool long");
	}
	if ($("#descriptionText").val().toString().length <descriptionLimit){
		arbData.effectInfo.description =cleanJsonToArbStr( $("#descriptionText").val()).toString();
	}else{
		alert ("description text is too long")
	}

	arbData.effectInfo.presetName = safeCharsForName ($("#presetName").val().toString());
	arbData.effectInfo.tags = ($("#presetTags").val().split(","));
	//detect if flags are active or not    
	
	//copy  mode settings
	($("#langSelec").val() ==("GLSL") ? arbData.effectMode.gl33_modeB=true : arbData.effectMode.gl33_modeB=false);
	($("#langSelec").val() ==("mExpr")? arbData.effectMode.expr_modeB=true : arbData.effectMode.expr_modeB = false);
	
	//copy compo settings	
	arbData.composition.resolution =safeCharsForName ( $("#resolutionName").val().toString());
	arbData.composition.layerPosition= safeCharsForName ($("#layerPositionName").val().toString());
	arbData.composition.layerScale= safeCharsForName ($("#layerScaleName").val().toString());
	arbData.composition.compResolution = safeCharsForName ($("#compResolutionName").val().toString());
	arbData.composition.time_sec =safeCharsForName ( $("#tsecName").val().toString());
	arbData.composition.time_frame =safeCharsForName ($("#tframeName").val().toString());
	arbData.composition.frame_rate = safeCharsForName ($("#fpsName").val().toString());
	arbData.composition.camera_position = safeCharsForName ($("#camera_pos").val().toString());
	arbData.composition.camera_target = safeCharsForName ($("#camera_targ").val().toString());
	arbData.composition.camera_rotation = safeCharsForName ($("#camera_rot").val().toString());
	arbData.composition.camera_zoom =safeCharsForName ( $("#camera_zoom").val().toString());
	//copy settings for expr
	
	arbData.math_expression.exprRGBModeB = $("#rgbmodeB").is(':checked');
	arbData.math_expression.expr_current_channel = safeCharsForName ($("#expr_current_channelName").val().toString());
	arbData.math_expression.expr_rgb_channel = safeCharsForName ($("#expr_rgb_channelName").val().toString());
	arbData.math_expression.expr_pix =safeCharsForName ($("#expr_pixName").val().toString());
	sendParamsSettings(arbData, "slider", numParams, 1, "sliderGrp");
	sendParamsSettings(arbData, "point", numParams, 3, "pointGrp");
	sendParamsSettings(arbData, "cbox", numParams, 1, "cboxGrp");
	sendParamsSettings(arbData, "color", numParams, 3, "colorGrp");
	sendParamsSettings(arbData, "rotation", numParams, 1, "rotationGrp");

	//copy layer settings
	arbData.gui_settings.layerGrp.grpName =safeCharsForName ($("#layerGrpName").val().toString());
	arbData.gui_settings.layerGrp.grpVisibleB =$("#layerGrpVisible").is(':checked');
	arbData.gui_settings.layerGrp.current_layer.name =safeCharsForName ( $("#layer00_name").val().toString());
	arbData.gui_settings.layerGrp.extLayer_1.name= safeCharsForName ($("#layer01_name").val().toString());
	arbData.gui_settings.layerGrp.extLayer_1.visibleB= $("#layer01Visible").is(':checked');
	arbData.gui_settings.layerGrp.extLayer_2.name =safeCharsForName ($("#layer02_name").val().toString());
	arbData.gui_settings.layerGrp.extLayer_2.visibleB= $("#layer02Visible").is(':checked');
	arbData.gui_settings.layerGrp.extLayer_3.name =safeCharsForName ($("#layer03_name").val().toString());
	arbData.gui_settings.layerGrp.extLayer_3.visibleB= $("#layer03Visible").is(':checked');
	arbData.gui_settings.layerGrp.extLayer_4.name =safeCharsForName ($("#layer04_name").val().toString());
	arbData.gui_settings.layerGrp.extLayer_4.visibleB= $("#layer04Visible").is(':checked');
	arbData = setFlags (arbData);
	arbData.effectInfo.minimalPluginVersion = setMinimalVersion (arbData);
	return arbData;
	}
/**
* setFlags: setflags for the plugin, depending of the shaders str
*input: arbData
*return: arbData updated
*/
function setFlags (arbData){
	var listLayers = [arbData.gui_settings.layerGrp.extLayer_1.name, arbData.gui_settings.layerGrp.extLayer_2.name, arbData.gui_settings.layerGrp.extLayer_3.name,  arbData.gui_settings.layerGrp.extLayer_4.name];
	if(arbData.effectMode.gl33_modeB){
		for (var i=0; i<listLayers.length; i++){			
			arbData.flags.pixelsCallExternalInputB[i] =setflagFromGL (arbData,[listLayers[i]]);
		}
		arbData.flags.presetHasWideInputB =setflagFromGL (arbData, [arbData.composition.time_sec,arbData.composition.time_frame]);
		arbData.flags.usesCameraB =setflagFromGL (arbData, [arbData.composition.camera_position,arbData.composition.camera_target, arbData.composition.camera_rotation, arbData.composition.camera_zoom, "cameraMat"]);	
	}else{
		for (var i=0; i<listLayers.length; i++){			
			arbData.flags.pixelsCallExternalInputB[i] = setflagFromExpr (arbData,[listLayers[i]]);
		}
		arbData.flags.presetHasWideInputB = setflagFromExpr (arbData, [arbData.composition.time_sec,arbData.composition.time_frame]);
		arbData.flags.usesCameraB = setflagFromExpr (arbData, [arbData.composition.camera_position,arbData.composition.camera_target, arbData.composition.camera_rotation, arbData.composition.camera_zoom, "cameraMat"]);
		}
	return arbData
	}
/**
*  setVersion  return higher version between currentMinimal and the requiered by the flag
*input: int minimalVersion int  reqVersion
*return: int version
*/
function setVersion(minimalVersion, reqVersion){
	if (parseInt(minimalVersion) < parseInt(reqVersion)){
		return reqVersion
	}else{
		return minimalVersion;
	}
	}
/**
 * setMinimalVersion: set minimal plugin version, depending from the flags
 *input: arbData
*return: int minmalVersion
*/
function setMinimalVersion (arbData){
	var minimalVersion = 115;
	for (var i=0; i<arbData.flags.pixelsCallExternalInputB.length; i++){
		if (arbData.flags.pixelsCallExternalInputB[i] == true){
			minimalVersion = setVersion(minimalVersion, 115);
		}
	}
	if (arbData.flags.presetHasWideInputB){
		minimalVersion = setVersion(minimalVersion, 115);
	}
	if (arbData.flags.usesCameraB){
		minimalVersion = setVersion(minimalVersion, 115);
	}
	return minimalVersion;
	}
/**
 * set default values when launching panel 
 *input: void
*return: void
*/
function defaultVal(){
	$("#langSelec").val("mExpr");
	langSelecFunc();
	toggleMenus("presetId");
	toggleMenus("presetId");
	toggleDescription();
	toggleEditor();
	openSettingsMenu("settingsGrp");
	}
/**
 * toggleRgbModeBox: force toggling in expression mode
*input: id id of the checkbox
*return: void
*/
function toggleRgbModeBox (idIn, boolIn){
	var currId = document.getElementById(idIn);
	if (boolIn){
		currId.checked =true;
	}else{
		currId.checked = false;
	}
}
/**
* toggleCheckbox: toggle checkboxes of the same class
*input: string className, id currId of the parent checkbox
*return: void
*/
function toggleCheckbox(className, currId){
	var classItems = document.getElementsByClassName(className);
	var parentItem =  document.getElementById(currId);
	if (parentItem.checked ==true){
		for (var i=0; i<classItems.length; i++){
			classItems[i].checked = true;
			}
		}	
	else{
		for (var i=0; i<classItems.length; i++){
			classItems[i].checked = false;
			}
		}
	}
/**
* resizeEditorsMarginLeft 
*input: int size of the margin on the left side
*return: void
*/
function resizeEditorsMarginLeft (size){
	var tabCl = document.getElementsByClassName("tabEditors");
	var newSize = (size+"px").toString();
	tabCl[0].style.marginLeft =  newSize;
	}
/**
* resizeEditorsMarginRight
*input: int size of the margin on the right side
*return: void
*/
function resizeSettingsMarginRight(size){
	var tabCl = document.getElementsByClassName("SettingsCol");
	var newSize = (size+"px").toString();
	tabCl[0].style.marginRight =  newSize;
	}
/**
* toggleSideBar: toggle the side bar of the menus
*input: void
*return: void
*/
function toggleSideBar(){
	var presetsSettingMenu = document.getElementById("presetSettingId");
	var Presetslib = document.getElementById("presetId");
	var wiki = document.getElementById("wiki");
	var settingsMenu = document.getElementById("paramSettingsId");
	var sidebar = document.getElementById("SettingsCol");
	if (presetsSettingMenu.style.display === "none"&&
	Presetslib.style.display === "none"&& 
	settingsMenu.style.display === "none"&&
	wiki.style.display === "none"){
		sidebar.style.display = "none";
		resizeEditorsMarginLeft (70);
	}
	else{
		sidebar.style.display = "block";
		resizeEditorsMarginLeft (350);
		}
	}
/**
* toggleEditor  toggle the editor's window on the right
*input: void
*return: void
*/
function toggleEditor(){
	var presetsMenu = document.getElementById("tabEditsMenu");
	if (presetsMenu.style.display === "none"){
		presetsMenu.style.display = "block";
		$('#SettingsCol').css("width",  290);
		}
	else{
		presetsMenu.style.display = "none";
		$('#SettingsCol').css("width", "100%");
		}

	}
/**
* toggleEditor  toggle the menus's window on the left
*input: id of the menu
*return: void
*/
function toggleMenus(id){

	var idArr =  ['presetSettingId', 'presetId', 'paramSettingsId', 'wiki'];
	for (var i=0; i<idArr.length; i++){
		var menu = document.getElementById(idArr[i]);
		if( id=== idArr[i]){
			if (menu.style.display === "none"){
				menu.style.display = "block";
				}
			else{
				menu.style.display = "none";
			}
		}
		else{
			menu.style.display = "none";
		}
	}
	if (document.getElementById('presetSettingId').style.display==="none"){
		var descrMenu = document.getElementById("descriptionId");
		descrMenu.style.display = "none";
		}
	toggleSideBar();
	}
/**
* toggleDescription  toggle the description editor inside the preset settings menu
*input: void
*return: void
*/
function toggleDescription(){
	var parentMenu = document.getElementById('presetSettingId');
	var descrMenu = document.getElementById("descriptionId");
	if (descrMenu.style.display === "none" && parentMenu.style.display !="none"){
		descrMenu.style.display = "block";
		}
	else{
		descrMenu.style.display = "none";
		}
	}
/**
* openSettingsMenu open the selected setting menu inside the preset settings menu
*input: id settingIdName
*return: void
*/
function openSettingsMenu (settingIdName){
	var settArray = ["settingsGrp","exprSettingsGrp", "layerGrp", "sliderGrp", "pointGrp", "cboxGrp", "colorGrp","rotationGrp"];
	
	for (var i =0; i<settArray.length; i++){
		if (settArray[i].toString() === settingIdName){
			var displayList = document.getElementById(settingIdName);
			displayList.style.display = "block";
		}else{
			var hideList = document.getElementById(settArray[i].toString());
			hideList.style.display = "none";
			}
		}
	}
/**
* set editors: create glsl editors in ace context
*input: void
*return: object edirtors
*/
function setEditors(){
	var editors = {};
	editors.gl33_frag_editor = glslEditor("gl33_frag_editor");
	editors.gl33_vert_editor= glslEditor("gl33_vert_editor");
	editors.expr_red_editor = glslEditor("expr_red_editor");
	editors.expr_green_editor = glslEditor("expr_green_editor");
	editors.expr_blue_editor = glslEditor("expr_blue_editor");
	editors.expr_rgb_editor = glslEditor("expr_rgb_editor");
	editors.expr_alpha_editor  = glslEditor("expr_alpha_editor");
	editors.expr_common_editor  = glslEditor("expr_common_editor");
	return editors;
	}
/**
* OpenEditor: open the window of  the tabbed editor
*input: event evt, string tabName
*return: void
*/
function openEditor(evt, tabName) {
		// Declare all variables
		var i, tabEditorList, glslGUILinks, consoleList;

		// Get all elements with class="tabcontent" and hide them
		tabEditorList = document.getElementsByClassName("tabEditor");
		for (i = 0; i < tabEditorList.length; i++) {
			tabEditorList[i].style.display = "none";
		}
		// Get all elements with class="tablinks" and remove the class "active"
		glslGUILinks = document.getElementsByClassName("glslGUI");
		for (i = 0; i < glslGUILinks.length; i++) {
			glslGUILinks[i].className = glslGUILinks[i].className.replace(" active", "");
		}
		// Show the current tab, and add an "active" class to the button that opened the tab
		document.getElementById(tabName).style.display = "block";

		//get all console items and hide unsed
		consoleList = document.getElementsByClassName("console");
		for (i = 0; i < consoleList.length; i++) {
			if (consoleList[i].id.indexOf (tabName) !=-1){
				consoleList[i].style.display = "block";
			}else{
				consoleList[i].style.display = "none";
			}
		}	
	}
/**
* mathGuiModeFunc: switch between expression mode and gl33 mode
*input: void
*return: void
*/
function mathGuiModeFunc(){
	var mathGui = document.getElementsByClassName("mathGUI");
		var glslGui = document.getElementsByClassName("glslGUI");
		
	for (var i =0; i< mathGui.length; i++){
		$(mathGui[i]).show();
	}
	
	for (var i =0; i< glslGui.length; i++){
		$(glslGui[i]).hide();
	}
	mathGUIRgbModeFunc();
	}
/**
* mathGUIRgbModeFunc: in expression mode, switch between group of rgb mode and splited rgb mode expressions
*input: void
*return: void
*/
function mathGUIRgbModeFunc(){
	if ($("#rgbmodeB").is(':checked')){
		$("#rgbExpBtn").show();
		$("#redExpBtn").hide();
		$("#greenExpBtn").hide();
		$("#blueExpBtn").hide();
		openEditor(event, 'expr_rgb_tab');
	}else{
		$("#rgbExpBtn").hide();
		$("#redExpBtn").show();
		$("#greenExpBtn").show();
		$("#blueExpBtn").show();
		openEditor(event, 'expr_alpha_tab');
	}

	}
/**
* glslGuiModeFunc: hide epxressions window and show gl330 windows
*input: void
*return: void
*/
function glslGuiModeFunc(){
	var mathGui = document.getElementsByClassName("mathGUI");
	var glslGui = document.getElementsByClassName("glslGUI");
	for (var i =0; i< mathGui.length; i++){
			$(mathGui[i]).hide();
		}
	for (var i =0; i< glslGui.length; i++){
		$(glslGui[i]).show();
	}
	openEditor(event, 'gl33_frag_tab');

	}	
/**
* langSelecFunc(): call functions to switch between epxression and gl330 modes
*input: void
*return: void
*/
function langSelecFunc() {
		var langSelec = document.getElementById("langSelec").value;
		if (langSelec === "mExpr"){
			mathGuiModeFunc();
		  }
	  else if (langSelec ==="GLSL"){
			glslGuiModeFunc();
		  }
	 }
/**
* glslEditor: create editor context with ace
*input: string glMode
*return: obj editor
*/
function glslEditor(glMode){
		var editor = ace.edit(glMode);
		editor.setTheme("ace/theme/ambiance");
		editor.session.setMode("ace/mode/glsl");
		//editor.setAutoScrollEditorIntoView(true);
		editor.session.setUseSoftTabs(true);
		editor.resize();
		editor.setOptions({
			fontFamily: "roboto",
			fontSize: "14px",
		  });
		return editor;
	}
/**
* loadPluginPresets: call jsx to load presets in panel and user lib folders.
*input: obj arbData (the function  extract  some infos from it)
*return: void
*/
function loadPluginPresets(arbData){
	var csInterface = new CSInterface();
	var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION)+"";
	var folderPluginpresetsPath  = csInterface.getSystemPath(SystemPath.EXTENSION)+"/json/pluginPresets/";
	var plugIdStr = arbData.effectInfo.effectName.toString()+arbData.effectInfo.pluginVersion;
	var objData = {};
	objData.extensionPath =extensionPath;
	objData.folderPluginpresetsPath = folderPluginpresetsPath;
	objData.plugIdStr = plugIdStr;
	objDataStr = JSON.stringify (objData);
	csInterface.evalScript('$._ext.listJsonFiles('+objDataStr+')');
	}
/**
* loadDefaultArb(): load the default arb preset, when lauching the  panel
*input: void
*return: void
*/
function loadDefaultArb(){
	var csInterface = new CSInterface();
	var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/json/pluginPresets";
	var defaultArbFile  =extensionRoot+ "/tl_defaultPreset.JSON";
	var result =  window.cep.fs.readFile(defaultArbFile);
	if (result.err == 0) {
		return  result.data;
		}
	}
/**
 * Convert the Color object to string in hexadecimal format;
 */
function toHex(color, delta) {
    function computeValue(value, delta) {
        var computedValue = !isNaN(delta) ? value + delta : value;
        if (computedValue < 0) {
            computedValue = 0;
        } else if (computedValue > 255) {
            computedValue = 255;
        }

        computedValue = Math.round(computedValue).toString(16);
        return computedValue.length == 1 ? "0" + computedValue : computedValue;
    }

    var hex = "";
    if (color) {
        with (color) {
             hex = computeValue(red, delta) + computeValue(green, delta) + computeValue(blue, delta);
        };
    }
	return "#" + hex;
	}
/**
 * Load JSX file into the scripting context of the product. All the jsx files in 
 * folder [ExtensionRoot]/jsx will be loaded. 
 */
function loadJSX() {
    var csInterface = new CSInterface();
	var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
	csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
	}
function evalScript(script, callback) {
    new CSInterface().evalScript(script, callback);
	}






