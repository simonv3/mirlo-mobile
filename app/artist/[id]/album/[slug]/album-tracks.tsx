import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { API_ROOT } from "@/constants/api-root";
import { useState, useEffect } from "react";
import { VideoView } from "expo-video";
import { usePlayer } from "@/state/PlayerContext";
import ProfileLink from "@/components/ProfileLink";
import PlayButton from "@/components/PlayButton";

type TrackItemComponentProps = {
  track: TrackProps;
  albumTracks: TrackProps[];
};

const TrackItem = ({ track, albumTracks }: TrackItemComponentProps) => (
  <View style={styles.listItem}>
    <PlayButton trackObject={track} albumTracks={albumTracks} />
    <Text style={{ color: "white", fontSize: 20 }}>{track.title}</Text>
    <Text style={{ color: "black", fontSize: 20 }}>{track.audio.duration}</Text>
  </View>
);

export default function AlbumTracks() {
  const { id, slug } = useLocalSearchParams();
  const [tracks, setTracks] = useState<TrackProps[]>([]);
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const router = useRouter();
  const { player, isPlaying, currentSource, setCurrentSource, setPlayerQueue } =
    usePlayer();

  useEffect(() => {
    // TODO: Refactor to use Tanstack Query
    const callback = async () => {
      const fetchedAlbum = await fetch(
        `${API_ROOT}/v1/trackGroups/${slug}/?artistId=${id}`
      ).then((response) => response.json());
      const copy = [...fetchedAlbum.result.tracks];
      copy.forEach((track: TrackProps) => {
        track.artist = fetchedAlbum.result.artist.name;
        track.albumId = fetchedAlbum.result.id;
      });
      setTracks(copy);
      setAlbumTitle(fetchedAlbum.result.title);
    };
    callback();
  }, [slug, id]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: albumTitle || "Loading...",
          headerRight: () => <ProfileLink />,
          headerLeft: () => (
            <Button title="Back" onPress={() => router.dismiss(1)} />
          ),
        }}
      />
      {currentSource && player && (
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={true}
          showsTimecodes={true}
        />
      )}
      <View style={styles.container}>
        <FlatList
          style={{ width: "100%" }}
          contentContainerStyle={styles.listContainer}
          data={tracks}
          renderItem={({ item }) => (
            <TrackItem track={item} albumTracks={tracks}></TrackItem>
          )}
        ></FlatList>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  listContainer: {
    backgroundColor: "#BE3455",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  text: {
    padding: 10,
    fontWeight: "bold",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#f0f0f0", // placeholder color while loading
  },
  video: {
    width: "100%",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
    zIndex: 1,
    //opacity: 0,
  },
});
