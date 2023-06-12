import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
admin.initializeApp()

export const updateWeather =
functions.firestore.document("cities-weather/boston-ma").onUpdate( change => {
    const after = change.after.data()

    const payload = {
        data: {
            temp: String(after.temp),
            condition: after.condition
        }
    }
    return admin.messaging().sendToTopic("weather_boston-ma", payload)
})


export const getWeatherArea = 
functions.https.onRequest((request, response) => {
    admin.firestore().doc("areas/greater-boston").get().then(areaSnapshot => {
        const cities = areaSnapshot.data().cities

        const promises = []
        for ( const city in cities){
            const p = admin.firestore().doc(`cities-weather/${city}`).get()
            promises.push(p)
        }
        return Promise.all( promises)
    }).then(citySnapshots => {
        const results= []
        citySnapshots.forEach(citySnap => {
            const data = citySnap.data()
            data.city = citySnap.id
            results.push(data)
        })
        response.send(results)
    }).catch((error) => {
        console.log(error)
        response.status(500).send(error)
      })
})

export const getWeatherRecords = functions.https.onRequest((request, response) => {
  admin.firestore().doc("cities-weather/boston-ma").get().then(snapshot => {
    const data = snapshot.data()
    response.send(data)
  }).catch((error) => {
    console.log(error)
    response.status(500).send(error)
  })
});
