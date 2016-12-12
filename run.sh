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
