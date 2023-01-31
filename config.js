/*
pageTitlePos = "TL", "TR", "BL", "BLs", "BR", "BRs", "Hide" (Top Left, Bottom Left Small ...)
titre = string
duration = int (secondes)
layout = { "dashboard", "events", "services", "media" }
content.dashboard = { "default", "image", "alert" }
content.events = { "" }
content.services = { "cafe", "washing", "wine", "port" }
content.media = { pathMedia }
*/

var dashboardConfig = {
	"param": [
		{
			"pageTitlePos": "TL",
			"titre": "accueil",
			"duration": 12,
			"layout": "dashboard",
			"content": "default"
		},
		{
			"pageTitlePos": "TL",
			"titre": "Evénements",
			"duration": 30,
			"layout": "events",
			"content": 4
		},
		{
			"pageTitlePos": "TL",
			"titre": "Boutique",
			"duration": 30,
			"layout": "services",
			"content": "cafe"
		},
		{
			"pageTitlePos": "BLs",
			"titre": "Media",
			"duration": 75,
			"layout": "media",
			"content": "videos/04.mp4"
		},

	]
}