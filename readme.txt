This is a proof of concept Blogging "Node.js / React" application illustrating 
how different micro services can communicate with each other asynchronously where
if one micro service becomes unavailable, it does not bring the entire application
down to its knees.

Presently this proof of concept application does not use a database. All the data 
created by the React client and consumed by the various micro services only exist 
in RAM memory. 

The following components have been included:

    1) "Client" is the React client which is capable of creating new Blog Posts 
        and Comments that can be attached to each Blog Post. It should however be 
        noted that the users will need to manually refresh their browser after
        each new Blog Post or Comment is created. The focus of this proof of
        concept project was on delivering a robust micro services architecture
        and less on the React UI screens. Fixing this behavior of the client will
        be looked into as time dictates.

    2) "Posts" service exists to manage all new Blog Post requests events coming
        from the React client. 
      
    3) "Comments" service exists to manage all new Comments which are associated
        with a specific Blog Post from the React client. 

    4) "Query" service is used by the React client to manage and retrieve all active 
       Blog Posts as well as any Comments associated with a given Blog Post. 

    5) "Moderation" service is used to moderate every Comment to determine whether
        or not the status of a given Comment has been approved or rejected. Presently
        this proof of comments application does not like "Clowns", so any Comments
        that have a "clown" embedded in the Comment will be rejected. 

    6) "Event Bus" service is what makes the entire micro service asynchronous
        communication possible as its purpose is to route all incoming events as 
        outgoing events to the various services to keep them informed of the state 
        of the date at any given time. In this proof of concept application, the
        "Event Bus" has been implemented using "node.js" JavaScript code just like
        all the other services which make up the suite of micro services. however
        if this was an actual production system, a commercially available equivalent
        tool such as RabbitMQ or Kafka could be used instead.

The workflow of events while creating a new Blog Post is the following:

    - The user creates a new Blog Post in the React client.

    - The React client sends an event to the "Posts" service.

    - The "Posts" service persists the new Blog Post in memory before forwarding
      this event on to the "Event Bus".

    - Upon receipt the "Event Bus", it not only records the event in its own
      memory data store, but then it forwards the event on to "Posts", "Comments", 
      "Query" and "Moderation" services.

    - The "Posts" and "Comments" services will receive these new Blog Posts events 
      from the "Event Bus" but they won't need to do anything with it.

    - The "Query" service will persist the new Blog Post into its own memory 
      data store as it will be this data store that is ultimately consumed by
      the React client when the client wants to render all available Blog Posts.

    - Finally the "Moderation" service will also receive this event, but since
      the "Moderation" service was setup to moderate comments, it will ignore
      this new Blog Post creation event.

The workflow of events while creating a new Comments is the following:

    - The user creates a new Comment that is associated with an existing Blog Post 
      in the React client.

    - The React client sends an event to the "Comments" service.

    - The "Comments" service persists the new Comment in memory before forwarding
      this event on to the "Event Bus".

    - Upon receipt the "Event Bus", it not only records the event in its own
      memory data store, but then it forwards the event on to "Posts", "Comments", 
      "Query" and "Moderation" services.

    - The "Posts" and "Comments" services will receive these new Comments events from 
      the "Event Bus" but they won't need to do anything with it.

    - The "Query" service will persist the new Comment into its own memory data store 
      as it will be this data store that is ultimately consumed by the React client 
      when the client wants to render all available Blog Post Comments.

    - The "Moderation" service will receive this event and the contents of the Comment
      will then be evaluated (ie: moderated) and the result of this moderation event
      will then be sent back to the "Event Bus".

    - The "Event Bus" will receive this event, record it and then proceed to forward
      the event on to "Posts", "Comments", "Query" and "Moderation" services.

    - The "Posts" and "Moderation" services will ignore this event. However the "Comments"
      and the "Query" services won't ignore it they will both update their respective
      data stores to ensure the Blog Post Comments and associated status are in sync.

This solution may appear to be complex at times with duplicated event handling occuring
and yes, there is a level of complexity and duplication going on. But what makes this
solution viable is the asynchronos nature. Yes the failure of one service will cause a
diruption of normal service to the application as a whole, but the failure will not bring 
the application to its knees and once the failed services are restored, the system is 
able to recover on its own. Example: one of the tasks the "Query" service does when it
is being restarted is to ask the "Event Bus" for any events that the "Event Bus" might
have received while the "Query" service was down and since it is the "Query" service
that the React client relies on to serve up all available Blog Posts and associated
Comments, restoration of the "Query" service does allow the React client to re-render
all its data reliably. The only service that is really critical, is the "Event Bus".

To run this proof of concept application, first one must have "node.js" installed on
their system. Once it is installed you can do the following:

    1) Open up a terminal for each service (this also includes the React client),
       navigate to the root folder of each service and then type the following in
       the terminal: "npm install". This operation will download all npm package
       dependencies to your system.

    2) Open up six terminal windows, navigate to the root folder of each terminal
       and type the following: "npm start". This operation will launch every service
       including React client and below are the ports that each services listens on:

          Port: 3000 - React Client
          Port: 4000 - Posts Service
          Port: 4001 - Comments Service
          Port: 4002 - Query Service
          Port: 4003 - Moderation Service
          Port: 4005 - Event Bus

Finally, I must give credit to Stephen Grider as it was his excellent instruction on
the topic which has allowed myself to become familiar with learning how micro services
can be used reliably and efficiently used with each other. This is only a proof on 
concept project. But a full stack implementation is in the works and it will be shared 
when the time is right and it will be at that time when the deployment inside of Docker
and Kubernetes containers will be utilized. Thank you and once again none of this would
have been possible without the excellent instruction from Stephen Grider.

PS: In case folks are wondering, I do not have a phobia of clowns. I only used them as 
the keyword filter in the "Moderation" service as something needed to be used to reject
a given Comment and why not use "clowns" since some people do have phobias and I am sorry
if you are one of these people. haha :D
