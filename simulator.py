import time
import random
# from kafka import KafkaProducer
from datetime import datetime
import json

from confluent_kafka import Producer

# Kafka broker address
bootstrap_servers = 'localhost:9092'

# Kafka topic to publish to
topic = 'events'



events = ['GRB', 'ABR', 'UVR', 'XRR', 'CMT']
with open('BSC.json', 'r') as file:
    json_data = file.read()
conf = {'bootstrap.servers': bootstrap_servers}

# Create Kafka producer
producer = Producer(conf)

data_list = json.loads(json_data)
sources = ['MMT', 'GOT', 'VLT', 'ST', 'LBT', 'SALT', 'K12', 'HET', 'GTC', 'GMT', 'TMT', 'EELT']
while True:
    timestamp = datetime.now()
    urgency = random.randint(1, 5)
    source = sources[random.randint(0, len(sources) - 1)]
    event = events[random.randint(0, len(events) - 1)]
    idx = random.randint(0, len(data_list) - 1)
    degrees, minutes_DEC, seconds_DEC = map(str, data_list[idx]['DEC'].split(':'))
    hours, minutes_RA, seconds_RA = map(str, data_list[idx]['RA'].split(':'))
    input_string = '''
    {
      "RA": {"hours": "%(hours)s", "minutes": "%(minutes_RA)s", "seconds": "%(seconds_RA)s"},
      "DEC": {"degrees": "%(degrees)s", "minutes": "%(minutes_DEC)s", "seconds": "%(seconds_DEC)s"},
      "eventType": "%(event)s",
      "eventSource": "%(source)s",
      "urgency": %(urgency)d,
      "eventTS": "%(timestamp)s"
    }
    ''' % {
        "hours": hours,
        "minutes_RA": minutes_RA,
        "seconds_RA": seconds_RA,
        "degrees": degrees,
        "minutes_DEC": minutes_DEC,
        "seconds_DEC": seconds_DEC,
        "event": event,
        "source": source,
        "urgency": urgency,
        "timestamp": timestamp
    }
    json_object = json.loads(input_string)
    # Convert JSON data to string and produce JSON message
    producer.produce(topic, value=json.dumps(json_object).encode('utf-8'))
    producer.flush()
    time.sleep(10)
