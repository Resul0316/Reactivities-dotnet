import { Fragment, useEffect, useState } from 'react'
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import Navbar from './Navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { v4 as uuid } from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

function App() {
  const [activities, setActivities]             = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode]                 = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [submitting, setSubmitteing]            = useState(false);

  useEffect(() => {
    agent.Activities.list()
    .then(response => {
      const activities: Activity[] = [];
      response.forEach(activity => {
        activity.date = activity.date.split('T')[0];
        activities.push(activity);
      })
      setActivities(activities);
      setLoading(false);
    })
  }, [])

  function handleSelectActivity(id: string) {
    setSelectedActivity(activities.find(el => el.id === id))
  }

  function handleCancelSelectActivity() {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?: string) {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleFormClose() {
    setEditMode(false);
  }

  function handleCreateOrEditctivity(activity: Activity) {
    setSubmitteing(true);
    if (activity.id) {
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(el => el.id !== activity.id), activity])
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmitteing(false);
      })
    } else {
      activity.id = uuid();
      agent.Activities.create(activity).then(() => {
        setActivities([...activities, {...activity, id:uuid()}])
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmitteing(false);
      })
    }
  }

  function handleDeleteActivity(id: string) {
    setSubmitteing(true)
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(el => el.id !== id)])
      setSubmitteing(false);
    })
  }

  if (loading) return < LoadingComponent content='Loading App'/>

  return (
    <Fragment>
      <Navbar openForm={handleFormOpen} />
      <Container style={{marginTop:"7em"}}>
      <ActivityDashboard 
      activities={activities}
      selectedActivity={selectedActivity}
      selectActivity={handleSelectActivity}
      cancelSelectActivity={handleCancelSelectActivity}
      editMode={editMode}
      openForm={handleFormOpen}
      closeForm={handleFormClose}
      createOrEdit={handleCreateOrEditctivity}
      deleteActivity={handleDeleteActivity}
      submitting={submitting}
      />
      </Container>
    </Fragment>
  )
}

export default App
