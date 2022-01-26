import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  Image,
  PanResponder,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const USERS = [
  { id: 1, uri: require("./assets/users/1.jpg") },
  { id: 2, uri: require("./assets/users/2.jpg") },
  { id: 3, uri: require("./assets/users/3.jpg") },
  { id: 4, uri: require("./assets/users/4.jpg") },
];

export default function App() {
  const position = useRef(new Animated.ValueXY()).current;
  const [currentIndex, setCurrentIndex] = useState(USERS[0].id);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((prev) => prev + 1);
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((prev) => prev + 1);
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    position.setValue({
      x: 0,
      y: 0,
    });
  }, [currentIndex]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: "clamp",
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: "clamp",
  });

  const renderUsers = () => {
    return USERS.map((item) => {
      const activeCard = item.id === currentIndex;
      const nextCard = item.id === currentIndex + 1;
      const panResponderProps = activeCard ? panResponder.panHandlers : {};
      const additionalStyles = activeCard
        ? {
            transform: [
              {
                rotate,
              },
              ...position.getTranslateTransform(),
            ],
          }
        : {};
      const nextCardStyles = nextCard
        ? {
            opacity: nextCardOpacity,
            transform: [{ scale: nextCardScale }],
          }
        : {};

      if (!activeCard && !nextCard) return null;

      return (
        <Animated.View
          {...panResponderProps}
          key={item.id}
          style={[styles.card, additionalStyles, nextCardStyles]}
        >
          {activeCard && (
            <>
              <Animated.View
                style={[
                  { opacity: dislikeOpacity },
                  styles.dislikeTextContainer,
                ]}
              >
                <Text style={styles.dislikeText}>NOPE</Text>
              </Animated.View>

              <Animated.View
                style={[{ opacity: likeOpacity }, styles.likeTextContainer]}
              >
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
            </>
          )}

          <Image style={styles.image} source={item.uri} />
        </Animated.View>
      );
    }).reverse();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header} />
      <View style={styles.content}>{renderUsers()}</View>
      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
  },
  content: {
    flex: 1,
  },
  footer: {
    height: 60,
  },
  card: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: "absolute",
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
    resizeMode: "cover",
    borderRadius: 20,
  },
  likeTextContainer: {
    position: "absolute",
    top: 50,
    left: 40,
    zIndex: 10,
    transform: [{ rotate: "-30deg" }],
  },
  likeText: {
    borderWidth: 1,
    borderColor: "green",
    color: "green",
    fontSize: 32,
    fontWeight: "800",
    padding: 10,
  },
  dislikeTextContainer: {
    position: "absolute",
    top: 50,
    right: 40,
    zIndex: 10,
    transform: [{ rotate: "30deg" }],
  },
  dislikeText: {
    borderWidth: 1,
    borderColor: "red",
    color: "red",
    fontSize: 32,
    fontWeight: "800",
    padding: 10,
  },
});
