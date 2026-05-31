import { BreakingNews } from "./components/BreakingNews";
import { FeedActions } from "./components/FeedActions";
import { Header } from "./components/Header";
import { PetCarousel } from "./components/PetCarousel";
import { TaskList } from "./components/TaskList";
import { WarnCard } from "./components/WarnCard";
import { useChewieMood } from "./hooks/useChewieMood";
import { useTasks } from "./hooks/useTasks";
import "./App.css";

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
  } = useChewieMood();

  const { tasks, addTask, postponeTask, removeTask, giveUpAll } = useTasks();

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
              onAdd={addTask}
              onPostpone={postponeTask}
              onRemove={removeTask}
              onGiveUpAll={giveUpAll}
            />
            <WarnCard />
          </aside>
        </div>
      </main>
      {news && <BreakingNews message={news} />}
    </div>
  );
}

export default App;
