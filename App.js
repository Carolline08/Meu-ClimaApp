import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [cidade, setCidade] = useState("Recife");
  const [busca, setBusca] = useState("");
  const [clima, setClima] = useState(null);
  const [previsao, setPrevisao] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  async function buscarClima(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      setClima(response.data.current);

      const dias = response.data.daily.time.map((dia, index) => ({
        dia,
        max: response.data.daily.temperature_2m_max[index],
        min: response.data.daily.temperature_2m_min[index],
      }));

      setPrevisao(dias);
    } catch (error) {
      console.log(error);
    }
  }

  async function buscarCidade() {
    try {
      const geo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${busca}`
      );

      const resultado = geo.data.results[0];

      setCidade(resultado.name);

      buscarClima(resultado.latitude, resultado.longitude);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    buscarClima(-8.05, -34.88);
  }, []);

  if (!clima) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: darkMode
          ? "https://cdn.pixabay.com/photo/2020/07/04/06/41/clouds-5368444_640.jpg"
          : "https://images.ctfassets.net/hrltx12pl8hq/6bTvduuBDRZTU4J0dfjoLS/180fba3c8b0f990da177f2f2654bc820/0_hero.webp?fit=fill&w=600&h=400",
      }}
      style={styles.background}
      blurRadius={2}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: darkMode ? "#000000aa" : "#00000055" },
        ]}
      >
        <TouchableOpacity
          style={styles.darkButton}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Ionicons
            name={darkMode ? "sunny" : "moon"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>{cidade}</Text>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Buscar cidade"
            placeholderTextColor="#ddd"
            style={styles.input}
            value={busca}
            onChangeText={setBusca}
          />

          <TouchableOpacity onPress={buscarCidade}>
            <Ionicons name="search" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Ionicons name="partly-sunny" size={70} color="#FFD700" />

          <Text style={styles.temp}>
            {clima.temperature_2m}°C
          </Text>

          <Text style={styles.info}>
            Umidade: {clima.relative_humidity_2m}%
          </Text>

          <Text style={styles.info}>
            Vento: {clima.wind_speed_10m} km/h
          </Text>
        </View>

        <Text style={styles.subtitulo}>Próximos 7 dias</Text>

        <FlatList
          data={previsao}
          horizontal
          keyExtractor={(item) => item.dia}
          renderItem={({ item }) => (
            <View style={styles.dayCard}>
              <Text style={styles.dayText}>
                {item.dia.slice(5)}
              </Text>

              <Ionicons
                name="cloud-outline"
                size={32}
                color="#fff"
              />

              <Text style={styles.dayText}>
                {item.max}° / {item.min}°
              </Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },

  darkButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff33",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },

  card: {
    backgroundColor: "#ffffff22",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
  },

  temp: {
    fontSize: 55,
    color: "#fff",
    fontWeight: "bold",
  },

  info: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
  },

  subtitulo: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
  },

  dayCard: {
    backgroundColor: "#ffffff22",
    padding: 20,
    borderRadius: 20,
    marginRight: 15,
    alignItems: "center",
    width: 120,
  },

  dayText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
});