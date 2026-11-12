cmake_minimum_required(VERSION 3.16)
project(SmartDJMediaPlayer LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(SmartDJ
    src/main.cpp
    src/audio/AudioDeck.cpp
    src/audio/AudioEffects.cpp
    src/audio/DJMixer.cpp
    src/audio/EnvironmentPresetManager.cpp
    src/audio/ConsoleAudioBackend.cpp
    src/model/SmartDJModel.cpp
    src/controller/DJController.cpp
    src/view/ConsoleView.cpp
)

target_include_directories(SmartDJ PRIVATE include)
