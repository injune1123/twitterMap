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

## elasticsearch reference with sentiment analysis

`
POST /tweets
{
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
               },
               "tweet_sentiment_score":{
                   "type":"double"
               },
               "tweet_sentiment_type":{
                   "type":"string"
               }
            }
         }
      }
}
`

# Install Java
sudo yum -y install java wget

# Turn off firewall
sudo /etc/init.d/iptables stop
sudo chkconfig iptables off

# Download Nodejs and Kafka
wget https://nodejs.org/download/release/latest-v6.x/node-v6.9.2-linux-x64.tar.gz
tar -zxvf node-v6.9.2-linux-x64.tar.gz
wget http://www.trieuvan.com/apache/kafka/0.10.1.0/kafka_2.11-0.10.1.0.tgz
tar -zxvf kafka_2.11-0.10.1.0.tgz

# Start zookeeper and kafka
nohup kafka_2.11-0.10.1.0/bin/zookeeper-server-start.sh kafka_2.11-0.10.1.0/config/zookeeper.properties > zookeeper.log 2>&1 &
nohup kafka_2.11-0.10.1.0/bin/kafka-server-start.sh kafka_2.11-0.10.1.0/config/server.properties > kafka.log 2>&1 &

# Create two topics
# raw_tweets will store the tweets from twitter stream
# tweets_with_semtiment_score will store the scored tweets
kafka_2.11-0.10.1.0/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic rawtweets
kafka_2.11-0.10.1.0/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic tweetswithsentimentscore

# make node cmd availabe on commandline
export PATH=$PATH:/home/centos/node-v6.9.2-linux-x64/bin/

# Download the source code
git colne https://github.com/injune1123/twitterMap.git
cd twitterMap

# Install all dependencies
npm install

# Start all three components
node app-kafka.js > app-kafka.log 2>&1 &
node worker-kafka.js > worker-kafka.log 2>&1 &
node streaming-server-kafka.js > streaming-server-kafka.log 2>&1 &
