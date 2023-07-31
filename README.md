# NASA Project
Project in the course "Databases".
The idea of the project is to demonstrate the behaviour of space objects and to handle different types of data.
Some of the data comes from a random simulator the creates random events and sends them via Kafka, some of the comes from
the NASA API which is open to public and some of the data comes from spaceweatherlive.com/en/solar-activity.html which contains information about the
sun and images.
The goal of the project is to create a dashboard page that contains a summary of the events sent by the simulator, a page that contains 
the distribution of near earth objects in the past month, a page that contains a table with information of the near earth objects in the past 24 hours, a page
that contains information about the sun and a page that allows to browse events within specific dates and filter by urgency and source.

### Setting the project
To run the project you firstly need to install the packages. This can be done by the command: ```npm install```.

After the packages are installed you need to run the simulator. To do so you need to write: ```python3 simulator.py```

Make sure to run the redis server and the elastic search. To do so open WSL window and run the command ```redis-server``` and open the 
docker application and run the elastic search container.

Now, to run the server, write the command: ```npm start```. The project by default runs on "localhost:3000".
To get the data from the kafka you need to run the kafka server. To do so, open a new terminal and write: ```cd servers```. To run the 
server you may write: ```node kafka_es_server.js```.

### Working with the project
After you ran the server you may use it. Enter to your browswer and enter the address: "localhost:3000".

The default page contains the dashboard of the project. In the dashboard you can find the following: number of critical events the occured
in the last 24 hours, number of total events in the last 24 hours, new critical event (if exist), last event that obtained from the kafka, a pie
graph that shows the distribution of events by urgency in the last week, line graph that contains the distribution of the number of evnents in the last 24 hours and 
a bar chart that contains the distribution of the number of events in the last week by event type.

The near earth objects graph can be found here: "http://localhost:3000/nasa_graph". It contains a graph that shows the distribution of the number of near earth objects 
in the last month sorted by the maximum estimated diameter.

The table of near earth objects contains the information of objects that passed near the earth in the past 24 hours. The data contains the name of the object, minimum and
maximum estimated diameter, close approace date and if the object is potentially hazardous. The address can be found here: "http://localhost:3000/neotable".

Information about the sun can be found here: "http://localhost:3000/sun_info". The information contains a pictures of: Coronal Holes, Coronal Mass Ejections, Far Side,
Solar Flares, Sunspot Regions and a graph of the solar activity past two hours.

The search table can be found here: "http://localhost:3000/search_table". The default is to filter the events by the last week. You can filter the events by dates - choose
the starting date and the ending date and optionally you can filter by source and/or urgency (1-5).

### Credits
The project was created by: Benjamin Saldman, Itzik Ben Shushan and Tom Koltunov. Ariel University 2023. 


