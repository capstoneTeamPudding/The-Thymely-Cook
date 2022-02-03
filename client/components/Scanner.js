/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { useDispatch, useSelector, connect } from "react-redux";
import { BarCodeScanner } from "expo-barcode-scanner";
import { ADD_FOOD_ITEM } from "../store/foodItems";
import axios from "axios";

let EdamamURL = "https://api.edamam.com/api/food-database/v2/parser?";
const EDEMAM_TYPE = "&nutrition-type=logging";

export default function Scanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("No Barcode Scanned Yet!");

  const dispatch = useDispatch();
  const allFoodItems = useSelector((state) => state.foodItemsReducer);
  const addFoodItem = (foodItem) => {
    dispatch(ADD_FOOD_ITEM(foodItem));
  };

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const addToFridgeAlert = (foodName) =>
    Alert.alert(foodName, `Would you like to add ${foodName} to your fridge?`, [
      {
        text: "No",
        onPress: () => {
          setScanned(false);
          setText(false);
        },
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () =>
          console.log("AYE WE GETTIN PLACES TIME TO ADD TO FRIDGE BB"),
      },
    ]);

  const foodName = (foodItemData) => {
    let foodObject = foodItemData.hints[0].food;
    let foodName = foodObject.label;
    addFoodItem(foodName);
    setText(foodName);
    addToFridgeAlert(foodName);
  };

  const fetchFoodItem = async (data) => {
    const URL = `${EdamamURL}app_id=ac348bb8&app_key=1ebf1a9a2fd8a87a83ce0aa38a7f00ad&upc=${data}${EDEMAM_TYPE}`;
    const res = await axios.get(URL);
    const foodItemData = res.data;
    foodName(foodItemData);
  };
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    console.log("data", data);
    fetchFoodItem(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ marign: 10 }}>
          Request Denied: How would you like to add food to your Fridge?
        </Text>
        <Button
          title={"Scan Barcode"}
          OnPress={() => askForCameraPermission()}
        />
        <Button
          title={"Add Manually"}
          OnPress={() => {
            return (
              <View style={styles.container}>
                <Text> Coming Soon! </Text>
              </View>
            );
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.maintext}>{text}</Text>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.barcode}
      />
      {scanned && (
        <View>
          <BarCodeScanner style={{ height: 0 }} />
          <Button
            title={"Tap to Scan Again"}
            onPress={() => {
              setScanned(false);
              setText(false);
            }}
          />
          <Button
            title="Go to Fridge"
            onPress={() => navigation.navigate("Fridge")}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  barcode: {
    backgroundColor: "tomato",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
});
