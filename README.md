# twitterMap

## Description
This is a map that shows tweets. You will see the red dots as incoming data. Yellow circles are density, and blue dots resembles single tweets

## How to run twitterMap on your local computer
1. clone the repo to your folder
2. run $npm install
3. open the sample-config.json file and replace "YOU-INFO" with your true info, and rename the "sample-config.json" file to "config.json"
4. run $node app
5. open your favorite browser and type "localhost:8081/static/twitter-map.html" to see twitterMap


## npm Packages Used
* "aws-es"
* "elasticsearch"
* "express"
* "lodash"
* "nconf"
* "socket io"
* "twit"

## Front-end Library Used
* "leaflet"
* "reset css"
* "bootstrap"
* "axios"
* "jquery"
* code fragment from "geohash" http://www.movable-type.co.uk/scripts/geohash.html

## elasticsearch reference
`{
      "mappings": {
         "tweets": {
            "properties": {
               "tweet_content": {
                  "type": "string"
               },
               "tweet_geo_coord": {
                  "type": "geo_point",
                  "geohash": true,
                  "geohash_prefix": true,
                  "geohash_precision": 7
               }
            }
         }
      }
}`
