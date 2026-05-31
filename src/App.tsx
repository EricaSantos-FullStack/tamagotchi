import { BreakingNews } from "./components/BreakingNews";
import { FeedActions } from "./components/FeedActions";
import { Header } from "./components/Header";
import { PetCarousel } from "./components/PetCarousel";
import { SpotifyCard, PLAY_MUSIC_EVENT } from "./components/SpotifyCard";
import { TaskList } from "./components/TaskList";
import { WarnCard } from "./components/WarnCard";
import { useChewieMood } from "./hooks/useChewieMood";
import { useTasks } from "./hooks/useTasks";
import "./App.css";

const PULSE_THRESHOLD = 3;

function App() {
  const {
    mood,
    moodIdx,
    moods,
    news,
    goodFeedCount,
    badFeedCount,
    nextMood,
    prevMood,
    selectMood,
    feedChewie,
    suggestMusic,
  } = useChewieMood();

  const {
    tasks,
    pendingCount,
    addTask,
    postponeTask,
    removeTask,
    giveUpAll,
  } = useTasks();

  function handlePostpone(id: string) {
    postponeTask(id);
    suggestMusic();
  }

  // ao criar uma tarefa, a trilha do Chewie começa a tocar sozinha 🎵
  function handleAddTask(name: string) {
    addTask(name);
    window.dispatchEvent(new CustomEvent(PLAY_MUSIC_EVENT));
  }

  return (
    <div className="app-shell" data-mood={mood.key}>
      <div className="bg-tint" aria-hidden="true" />
      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />
      <main className="app">
        <Header streak={goodFeedCount} />
        <div className="grid">
          <section className="card pet-card">
            <p className="pet-label">SEU PET FLERKEN</p>
            <PetCarousel
              mood={mood}
              moodIdx={moodIdx}
              moods={moods}
              onPrev={prevMood}
              onNext={nextMood}
              onSelect={selectMood}
            />
            <FeedActions
              onFeed={feedChewie}
              goodFeedCount={goodFeedCount}
              badFeedCount={badFeedCount}
            />
          </section>
          <aside className="sidebar">
            <TaskList
              tasks={tasks}
              pendingCount={pendingCount}
              onAdd={handleAddTask}
              onPostpone={handlePostpone}
              onRemove={removeTask}
              onGiveUpAll={giveUpAll}
            />
            <WarnCard />
            <SpotifyCard pulsing={pendingCount >= PULSE_THRESHOLD} />
          </aside>
        </div>
      </main>
      {news && <BreakingNews message={news} />}
    </div>
  );
}

export default App;
