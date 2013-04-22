var tl;
var GlobalData
var TargetTable
var TitleField, StartField, EndField, ColourField
var earliest=Infinity, latest=-Infinity

//TODO - hook up rainbow checkbox
//TODO - need to add a vertical scrollbar, example here:
//http://trunk.simile-widgets.org/timeline/examples/compact-painter/compact-painter.html

		function onLoad() {
			// Get the table data using a metarequest
			TargetTable = $('select[name="TargetTable"]');
			TitleField = $('select[name="TitleField"]');
			StartField = $('select[name="StartField"]');
			EndField = $('select[name="EndField"]');
			ColourField = $('select[name="ColourField"]');
			
			
			scraperwiki.sql.meta(function(metadata, textStatus, jqXHR) {
			for(tableName in metadata.table){
				//console.log('table:', tableName, 'columns:', metadata.table[tableName].columnNames)
			}
			// Populate table options in the form with data from query
			// TODO - bug here that we always select the last one
				
				$.each(metadata.table, function(name) {
				//console.log(name)
				TargetTable.append($("<option />").val(name).text(name));
				});
			// Populate fields tables
				
				//console.log(metadata.table[tableName].columnNames[0])
				for (i=0;i<metadata.table[tableName].columnNames.length;i++) {
				var name=metadata.table[tableName].columnNames[i]
				TitleField.append($("<option />").val(name).text(name));
				StartField.append($("<option />").val(name).text(name));
				EndField.append($("<option />").val(name).text(name));
				ColourField.append($("<option />").val(name).text(name));
				};
				
			// Make default option selections
				
				var StartIndex=searchStringInArray ('start', metadata.table[tableName].columnNames)
				var EndIndex=searchStringInArray ('end', metadata.table[tableName].columnNames)
				var ColourIndex=searchStringInArray ('colour', metadata.table[tableName].columnNames)
				if (ColourIndex == -1){
					ColourIndex=searchStringInArray ('color', metadata.table[tableName].columnNames)
					}
				StartField.prop("selectedIndex",StartIndex+1)
				if (EndIndex>-1) {
					EndField.prop("selectedIndex",EndIndex+1)
					}
					
				if (ColourIndex>-1) {
					ColourField.prop("selectedIndex",ColourIndex+1)
					}
					
			// The only tricky one is the title field where we want to select one the ones which hasn't already been selected. 
				
			}, function(jqXHR, textStatus, errorThrown){
				console.log('Oh no! Error:', jqXHR.responseText, textStatus, errorThrown)
			})
			

		}
		
		function searchStringInArray (str, strArray) {
			for (var j=0; j<strArray.length; j++) {
				if (strArray[j].toLowerCase().match(str)) return j;
				}
			return -1;
}
        function showTimelineFunction() {
			cbRainbow = $('#rainbowColours');
			cbNullIsNow = $('#missingEndDatesNow');
		// Get data from form
			var QueryString="Select * from "+TargetTable.val()
			var d = moment()
			//console.log(d.valueOf())
			scraperwiki.sql(QueryString, function(data, textStatus, jqXHR) {
				//console.log('Great! Here is your war timeline data:', data);
				GlobalData=data
				DBaseOutput=
				{
					'dateTimeFormat': 'iso8601',
					'events': []
				}
				var i, StartArray, EndArray
				var rainbow=['red','orange','yellow','green','blue','indigo','violet']
				for (i=0; i<GlobalData.length; i++){ //GlobalData.length
				// TODO Need to handle None properly here
				// if EndField is none then set 'durationEvent':false
				// if ColourField is none then set color='blue'
					var durationEventValue=true, colourFieldValue='blue'
					if (cbRainbow.is(':checked')){
						colourFieldValue = rainbow[i%7]
						}
					if (EndField.val() == 'none') {
						durationEventValue = false
						EndFieldValue = null 
						//console.log(EndField.val())
						}
						else {
						// This handles null event ends according to the checkbox setting
						//console.log("**Separator**")
						//console.log(GlobalData[i][EndField.val()].toString())
						if (GlobalData[i][EndField.val()].toString() == '' && cbNullIsNow.is(':checked')){
							//console.log(GlobalData[i][EndField.val()].toString())
							EndFieldValue = moment().format()
							}
							else {
							EndFieldValue = GlobalData[i][EndField.val()].toString()
							}
						}
					if (ColourField.val() != 'none') {colourFieldValue = GlobalData[i][ColourField.val()]}
					// Populate the events data structure
					if (EndField.val() == 'none'){
						var e = {
						  start:GlobalData[i][StartField.val()].toString(),
						  title:GlobalData[i][TitleField.val()],
						  color:colourFieldValue,
						  durationEvent:durationEventValue
						  }
						 
						}
						else {
						var e = {
						  start:GlobalData[i][StartField.val()].toString(),
						  end: EndFieldValue,
						  title:GlobalData[i][TitleField.val()],
						  color:colourFieldValue,
						  durationEvent:durationEventValue
						 
						}
					}
					// Establish earliest and latest dates on the time line. Maybe I should use the ternary operator here.
					var firstmoment=moment(e.start), lastmoment=moment(e.end)
					if (firstmoment<earliest && firstmoment!==null) {
						earliest = firstmoment
						}
					if (lastmoment>latest && lastmoment!==null) {
						latest = lastmoment
						}
					if (lastmoment<earliest && lastmoment!==null) {
						earliest = lastmoment
						}
					if (firstmoment>latest && firstmoment!==null) {
						latest = firstmoment
						}
					DBaseOutput.events[i] = e
				} 
			//console.log(DBaseOutput)
            var eventSource = new Timeline.DefaultEventSource(0);
            
            // Example of changing the theme from the defaults
            // The default theme is defined in 
            // http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/api/scripts/themes.js
            var theme = Timeline.ClassicTheme.create();
            theme.event.bubble.width = 350;
            theme.event.bubble.height = 300;
            
			// We need to generate sensible defaults here automatically. Allowed values for interval units are:
			// MILISECOND,
			// SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR, DECADE, CENTURY, MILLENIUM
			
			//var max_of_array = Math.max.apply(Math, array);
			var midpoint=(latest.year()-earliest.year())/2+earliest.year()
			var span=(latest.year()-earliest.year())
			var logspan=Math.round(Math.log(span)/Math.log(10))
			//console.log(span)
			if (logspan == 3){
				smallInterval=Timeline.DateTime.DECADE
				bigInterval=Timeline.DateTime.CENTURY
				}
				
			if (logspan == 2){
				smallInterval=Timeline.DateTime.YEAR
				bigInterval=Timeline.DateTime.DECADE
				}
				
			if (logspan == 1){
				smallInterval=Timeline.DateTime.YEAR
				bigInterval=Timeline.DateTime.DECADE
				}
				
            //var d = Timeline.DateTime.parseGregorianDateTime("1700")
			var d = Timeline.DateTime.parseGregorianDateTime(midpoint)
            var bandInfos = [
                Timeline.createBandInfo({
                    width:          "80%", 
                    intervalUnit:   smallInterval, 
                    intervalPixels: 200,
                    eventSource:    eventSource,
                    date:           d,
                    theme:          theme,
                    layout:         'original'  // original, overview, detailed
                }),
                Timeline.createBandInfo({
                    width:          "20%", 
                    intervalUnit:   bigInterval, 
                    intervalPixels: 200,
                    eventSource:    eventSource,
                    date:           d,
                    theme:          theme,
                    layout:         'overview'  // original, overview, detailed
                })
            ];
            bandInfos[1].syncWith = 0;
            bandInfos[1].highlight = true;
                        
            tl = Timeline.create(document.getElementById("tl"), bandInfos, Timeline.HORIZONTAL);
            // Adding the date to the url stops browser caching of data during testing or if
            // the data source is a dynamic query...
            // 
			//tl.loadJSON("TimeLineData.js?"+ (new Date().getTime()), function(json, url) {
			//tl.loadJSON("IngeniousPursuitsData.js", function(json, url) {
			// Copied from the ScraperWiki docs:
			//  https://code.google.com/p/simile-widgets/wiki/Timeline_EventSources
			
			
				//console.log(DBaseOutput)
				//DBaseOutputJSON=JSON.stringify(DBaseOutput)
				//This doesn't work:
				eventSource.loadJSON(DBaseOutput, "." ); //document.location.href
				// This works:
				//tl.loadJSON("WarsData.js?"+ (new Date().getTime()), function(json, url) {eventSource.loadJSON(json, url);});
			
			}, function(jqXHR, textStatus, errorThrown){
				console.log('Oh no! Error:', jqXHR.responseText, textStatus, errorThrown)
			})
        }
        var resizeTimerID = null;
        function onResize() {
            if (resizeTimerID == null) {
                resizeTimerID = window.setTimeout(function() {
                    resizeTimerID = null;
                    tl.layout();
                }, 500);
            }
        }