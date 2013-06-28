var tl;
var GlobalData
var TargetTable
var TitleField
var StartField
var EndField
var ColourField
var earliest=Infinity, latest=-Infinity

//TODO - need to adjust following lines to suit data:
// var d = Timeline.DateTime.parseGregorianDateTime("1700")
// intervalUnit:   Timeline.DateTime.DECADE,
// intervalUnit:   Timeline.DateTime.CENTURY
//TODO - hook up rainbow checkbox
//TODO - hook up how to handle the absence of a finish date
//TODO 

		function onLoad() {
			// Get the table data using a metarequest
			TargetTable = $('select[id="sourceTable"]');
			TitleField = $('select[id="titleField"]');
			StartField = $('select[id="startField"]');
			EndField = $('select[id="endField"]');
			ColourField = $('select[id="colourField"]');

			scraperwiki.sql.meta(function(metadata, textStatus, jqXHR) {
			for(tableName in metadata.table){
				console.log('table:', tableName, 'columns:', metadata.table[tableName].columnNames)
			}
			// Populate table options in the form with data from query
			// TODO - bug here that we always select the last one
				
				$.each(metadata.table, function(name) {
				//console.log(name)
				TargetTable.append($("<option />").val(name).text(name));
				});
			// Populate fields tables
				
				console.log(metadata.table[tableName].columnNames[0])
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
				
				for (i=0; i<GlobalData.length; i++){ //GlobalData.length
				// TODO Need to handle None properly here
				// if EndField is none then set 'durationEvent':false
				// if ColourField is none then set color='blue'
					var durationEventValue=true, colourFieldValue='blue'
					if (EndField.val() == 'none') {
						durationEventValue = false
						EndFieldValue = null 
						console.log(EndField.val())
						}
						else {
						EndFieldValue = GlobalData[i][EndField.val()].toString()
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
					if (moment(e.start)<earliest) {
						earliest = moment(e.start)
						}
					if (moment(e.end)>latest) {
						latest = moment(e.end)
						}
					if (moment(e.end)<earliest) {
						earliest = moment(e.end)
						}
					if (moment(e.start)>latest) {
						latest = moment(e.start)
						}
					DBaseOutput.events[i] = e
				} 
				console.log(earliest)
				console.log(latest)
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
			console.log(latest)
			console.log(earliest)
			var midpoint=(latest.year()-earliest.year())/2+earliest.year()
			var span=Math.floor(Math.log((latest.year()-earliest.year())/2+earliest.year())/Math.log(10))
			
			if (span == 3){
				smallInterval=Timeline.DateTime.DECADE
				bigInterval=Timeline.DateTime.CENTURY
				}
				
			if (span == 2){
				smallInterval=Timeline.DateTime.YEAR
				bigInterval=Timeline.DateTime.DECADE
				}
				
			if (span == 1){
				smallInterval=Timeline.DateTime.MONTH
				bigInterval=Timeline.DateTime.YEAR
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