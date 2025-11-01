import { createFileRoute } from '@tanstack/react-router'
import RightLanding001 from '@/assets/bg-icon/right_landing001.svg'
import LeftLanding001 from '@/assets/bg-icon/left_landing001.svg'
import FeatureBox from '@/assets/bg-icon/featurebox.svg'
import shapesforlogic from '@/assets/bg-icon/shapesforlogic.svg'
import rainbow_small from '@/assets/bg-icon/rainbow_small.svg'
import small_stairs from '@/assets/bg-icon/small_stairs.svg'
import small_butterfly from '@/assets/bg-icon/small_butterfly.svg'
import landing002 from '@/assets/bg-icon/landing002.svg'
import logoArrow from '@/assets/bg-icon/logo-arrow.svg'
import landingLesson001 from '@/assets/bg-icon/landing-lesson001.svg'
import lesson_home_right001 from '@/assets/bg-icon/lesson_home_right001.svg'
import home_lesson_left001 from '@/assets/bg-icon/home_lesson_left001.svg'
import chevronright from '@/assets/bg-icon/chevron-right.svg'
import softstar from '@/assets/bg-icon/softstar.svg'
import starshape from '@/assets/bg-icon/starshape.svg'
import summerflower from '@/assets/bg-icon/summerflower.svg'
import bg_text from '@/assets/bg-icon/bg_text.svg'
import halfasterisk from '@/assets/bg-icon/halfasterisk.svg'
import rectangle_diamond from '@/assets/bg-icon/rectangle_diamond.svg'
import roadmapSample from '@/assets/bg-icon/roadmapsample1.png'
import booleImg from '@/assets/bg-icon/GeorgeBoole.png'
import vennImg from '@/assets/bg-icon/venn.jpg'
import circuitImg from '@/assets/bg-icon/circuits.jpg'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="bg-[var(--color-offwhite)] min-h-screen pt-20">
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={RightLanding001}
          alt="My Icon"
          className="hidden md:flex absolute h-full bottom-0 right-0 z-0"
        />
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={LeftLanding001}
          alt="My Icon"
          className="hidden md:flex absolute h-full left-0 z-0"
        />
        <div>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
            <div className="relative w-full max-w-4xl">
              <div className="flex flex-col items-center justify-center h-full relative">
                <img
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                  }}
                  draggable="false"
                  src={FeatureBox}
                  alt="My Icon"
                  className="absolute top-4 md:top-0 left-1/5 md:left-1/5 w-2/6 z-0 md:w-2/6 dark:opacity-10"
                />
                <img
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                  }}
                  draggable="false"
                  src={shapesforlogic}
                  alt="My Icon"
                  className="absolute bottom-0 right-1/6 md:right-1/5 w-10 md:w-max"
                />
                <h1 className="addgrotesk text-3xl sm:text-4xl md:text-7xl font-black text-center w-full md:w-2/3 z-10 relative pt-6 text-secondary-foreground px-4">
                  Interact, Learn. Master logic
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[200px] bg-background w-full flex flex-col md:flex-row justify-center md:space-x-32 py-8 px-4">
        <div className="h-18 md:h-32 addinter flex flex-row space-x-4 items-center justify-center py-4">
          <img
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
            draggable="false"
            src={small_stairs}
            alt="My Icon"
            className="w-8 h-8"
          />
          <p className="font-medium text-sm md:text-base">Boolean Algebra</p>
        </div>
        <div className="h-18 md:h-32 addinter flex flex-row space-x-4 items-center justify-center py-4">
          <img
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
            draggable="false"
            src={small_butterfly}
            alt="My Icon"
            className="w-8 h-8"
          />
          <p className="font-medium text-sm md:text-base">Simplify</p>
        </div>
        <div className="h-18 md:h-32 addinter flex flex-row space-x-4 items-center justify-center py-4">
          <img
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
            draggable="false"
            src={rainbow_small}
            alt="My Icon"
            className="w-8 h-8"
          />
          <p className="font-medium text-sm md:text-base">Circuit Equivalent</p>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-lightpurple)] relative py-12 px-4">
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={landing002}
          alt="My Icon"
          className="hidden md:block absolute z-10"
        />
        <div className="flex flex-col items-center justify-center p-6 md:p-20 space-y-5 md:space-y-3 max-w-4xl">
          <h1 className="w-full addgrotesk text-3xl md:text-5xl font-bold text-center">
            Tap, experiment, and understand!
          </h1>
          <p className="addinter text-sm md:text-base text-center">
            Explore Boolean logic through interactive exercises—no memorization,
            just hands-on learning!
          </p>
        </div>
        <div className="w-full max-w-4xl h-64 md:h-96 bg-background rounded-xl flex items-center justify-center z-20 mb-10 md:mb-20 box-shadow border overflow-hidden">
          <img src={roadmapSample} className="w-full h-full object-contain md:object-cover" alt="Roadmap" />
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bluez)] relative z-0 py-12 px-4">
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={landingLesson001}
          alt="My Icon"
          className="hidden md:block absolute w-4/5 mt-10 z-50"
        />
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={lesson_home_right001}
          alt="My Icon"
          className="hidden md:block absolute right-0 bottom-0 z-0"
        />
        <img
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          draggable="false"
          src={home_lesson_left001}
          alt="My Icon"
          className="hidden md:block absolute left-0 top-0 z-0"
        />

        <div className="flex flex-col items-center justify-center p-6 md:p-20 text-background">
          <h1 className="w-full addgrotesk text-3xl md:text-5xl font-bold text-center text-secondary-foreground">
            Lesson
          </h1>
          <p className="addinter text-sm md:text-base text-center text-secondary-foreground">
            Learn every step to boolean algebra success bit by bit!
          </p>
        </div>
        <div className="w-full max-w-7xl px-4 md:px-20 flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-10 justify-center z-10 pb-12">
          <div className="w-full md:w-86 h-auto rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col">
            <div className="w-full h-48 md:h-64 rounded-t-3xl overflow-hidden">
              <img
                src={booleImg}
                className="w-full h-full object-cover"
                alt="Boole"
              />
            </div>

            <div className="w-full p-4 space-y-2">
              <h1 className="addinter font-bold text-lg md:text-xl">
                Introduction to Boolean Algebra
              </h1>
              <p className="text-xs md:text-sm">
                Overview of Boolean Algebra, who created it, and its
                significance in mathematics and computer science.
              </p>
              <div className="flex flex-row items-center space-x-2 pt-3">
                <p className="text-xs">View lesson</p>
                <img src={logoArrow} alt="My Icon" className="h-2" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-86 h-auto rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col">
            <div className="w-full h-48 md:h-64 rounded-t-3xl overflow-hidden">
              <img
                src={circuitImg}
                className="w-full h-full object-cover"
                alt="Circuit"
              />
            </div>
            <div className="w-full p-4 space-y-2">
              <h1 className="addinter font-bold text-lg md:text-xl">
                Basic Boolean Operation
              </h1>
              <p className="text-xs md:text-sm">
                Introduction to fundamental operations: AND, OR, and NOT, with
                simple examples
              </p>
              <div className="flex flex-row items-center space-x-2 pt-3">
                <p className="text-xs">View lesson</p>
                <img src={logoArrow} alt="My Icon" className="h-2" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-86 h-auto rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col">
            <div className="w-full h-48 md:h-64 rounded-t-3xl overflow-hidden">
              <img
                src={vennImg}
                className="w-full h-full object-cover"
                alt="Venn"
              />
            </div>
            <div className="w-full p-4 space-y-2">
              <h1 className="addinter font-bold text-lg md:text-xl">Truth Table</h1>
              <p className="text-xs md:text-sm">
                Understanding how to construct and interpret truth tables, and
                how they represent logical expressions.
              </p>
              <div className="flex flex-row items-center space-x-2 pt-3">
                <p className="text-xs">View lesson</p>
                <img src={logoArrow} alt="My Icon" className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[50vh] w-full flex flex-col md:flex-row bg-[var(--color-offwhite)] py-12 px-4">
        <div className="w-full md:w-1/2 flex items-center justify-center px-5 md:px-20 mb-8 md:mb-0">
          <h1 className="text-2xl md:text-5xl font-bold addgrotesk text-center md:text-left">
            Teach Smarter, Learn Faster – With Classroom Mode.
          </h1>
        </div>
        <div className="w-full md:w-1/2 flex justify-center flex-col space-y-4 md:space-y-8">
          <p className="text-sm md:text-lg px-5 md:px-0 md:pr-20 text-center md:text-left">
            Bitwise empowers teachers with full control over their lessons. With
            Classroom Mode, educators can customize, reorder, and tailor Boolean
            Algebra topics to fit their teaching style. Track progress, create
            interactive exercises, and adapt lessons to meet student needs—all
            in one intuitive platform designed for effective learning.
          </p>
          <div className="flex flex-col md:flex-row w-full items-center justify-center md:justify-start gap-4">
            <button className="w-full md:w-auto text-xs md:text-base bg-[var(--color-grayz)] px-6 md:px-8 py-2 md:py-3 border border-black rounded-full box-shadow3 addgrotesk text-white">
              Host a class
            </button>
            <button className="w-full md:w-auto px-6 md:px-8 py-2 md:py-3 flex flex-row text-xs md:text-base items-center justify-center gap-2">
              Join a class <img src={chevronright} alt="My Icon" className="h-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="min-h-screen flex flex-col justify-center items-center relative z-0 py-12 px-4">
        <div className="flex flex-col items-center justify-center p-6 md:p-20 text-black space-y-4 z-50">
          <h1 className="w-full addgrotesk text-3xl md:text-4xl font-bold text-center text-secondary-foreground">
            Why choose bitwise?
          </h1>
          <p className="addinter text-sm md:text-base text-center text-secondary-foreground max-w-3xl">
            Let us give you some reasons why you should integrate bitwise to
            your learning!
          </p>
        </div>
        <img
          src={rectangle_diamond}
          alt="My Icon"
          className="hidden md:block absolute -top-180 md:-top-115 left-10 z-50 w-20 md:w-auto"
        />
        <img
          src={halfasterisk}
          alt="My Icon"
          className="hidden md:block absolute -top-30 right-0 z-50 w-8 md:w-auto"
        />
        <div className="w-full max-w-7xl px-4 md:px-20 flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-10 justify-center z-10">
          <img
            src={bg_text}
            alt="My Icon"
            className="hidden md:block absolute top-5 z-0 w-full dark:opacity-10"
          />
          <div className="w-full md:w-80 min-h-64 p-5 rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col space-y-3 relative">
            <img
              src={starshape}
              alt="My Icon"
              className="flex absolute -top-7 right-7 w-12 md:w-15"
            />
            <h1 className="addgrotesk font-bold text-xl md:text-2xl">For Students</h1>
            <h1 className="addinter font-bold text-sm">
              Master Boolean Algebra with Ease
            </h1>
            <div className="pl-4">
              <ul className="addinter text-xs space-y-2 list-disc list-inside">
                <li>
                  Interactive Learning – Engage with hands-on exercises and
                  step-by-step lessons.
                </li>
                <li>
                  Self-Paced Study – Learn at your own speed with structured
                  modules.
                </li>
                <li>
                  Practice & Quizzes – Reinforce concepts with interactive
                  questions and challenges.
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full md:w-80 min-h-64 p-5 rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col space-y-3 relative">
            <img
              src={softstar}
              alt="My Icon"
              className="flex absolute -top-7 right-7 w-12 md:w-15"
            />
            <h1 className="addgrotesk font-bold text-xl md:text-2xl">For Teachers</h1>
            <h1 className="addinter font-bold text-sm">
              A Smarter Way to Teach Boolean Algebra
            </h1>
            <div className="pl-4">
              <ul className="addinter text-xs space-y-2 list-disc list-inside">
                <li>
                  Customizable Lesson Plans – Reorder or modify lessons to fit
                  your teaching style.
                </li>
                <li>
                  Classroom Mode – Easily manage students and track their
                  progress.
                </li>
                <li>
                  Engaging Content – Provide students with dynamic exercises for
                  deeper understanding.
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full md:w-80 min-h-64 p-5 rounded-3xl border border-primary bg-primary-foreground box-shadow2 flex flex-col space-y-3 relative">
            <img
              src={summerflower}
              alt="My Icon"
              className="flex absolute -top-7 right-7 w-12 md:w-15"
            />
            <h1 className="addgrotesk font-bold text-xl md:text-2xl">For Everyone</h1>
            <h1 className="addinter font-bold text-sm">
              Why Bitwise Stands Out
            </h1>
            <div className="pl-4">
              <ul className="addinter text-xs space-y-2 list-disc list-inside">
                <li>
                  Flexible Learning Paths – Adaptable for beginners and advanced
                  learners.
                </li>
                <li>
                  Easy Integration – Works seamlessly in both online and
                  in-person classrooms.
                </li>
                <li>
                  Future Updates & Features – Continuous improvements to enhance
                  learning experiences.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button className="w-auto m-10 mt-8 px-6 py-2.5 text-sm tracking-wider text-background transition-colors duration-300 transform focus:outline-none border border-background hover:bg-background hover:text-black focus:ring focus:ring-gray-300 focus:ring-opacity-80">
          View all
        </button>
      </div>
    </>
  )
}
