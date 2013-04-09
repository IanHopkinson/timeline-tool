var tl;
var GlobalData
        function onLoad() {
            var eventSource = new Timeline.DefaultEventSource(0);
            
            // Example of changing the theme from the defaults
            // The default theme is defined in 
            // http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/api/scripts/themes.js
            var theme = Timeline.ClassicTheme.create();
            theme.event.bubble.width = 350;
            theme.event.bubble.height = 300;
            
            var d = Timeline.DateTime.parseGregorianDateTime("1700")
            var bandInfos = [
                Timeline.createBandInfo({
                    width:          "80%", 
                    intervalUnit:   Timeline.DateTime.DECADE, 
                    intervalPixels: 200,
                    eventSource:    eventSource,
                    date:           d,
                    theme:          theme,
                    layout:         'original'  // original, overview, detailed
                }),
                Timeline.createBandInfo({
                    width:          "20%", 
                    intervalUnit:   Timeline.DateTime.CENTURY, 
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
			
			scraperwiki.sql("select * from Sheet1", function(data, textStatus, jqXHR) {
				console.log('Great! Here is your war timeline data:', data);
				GlobalData=data
				DBaseOutput=
				{
					'dateTimeFormat': 'iso8601',
					'events': []
				}
				var i
				for (i=0;i<GlobalData.length;i++){ //GlobalData.length
					var e={start:GlobalData[i].Start.toString(),end:GlobalData[i].End.toString(),title:GlobalData[i].War,color:GlobalData[i].ColourCode }
					DBaseOutput.events[i]=e
				} 
				//DBaseOutputJSON=JSON.stringify(DBaseOutput)
				//This doesn't work:
				eventSource.loadJSON(DBaseOutput,"." ); //document.location.href
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