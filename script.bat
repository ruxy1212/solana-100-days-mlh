@echo off
setlocal enabledelayedexpansion

if "%~1"=="--create-week" (

  set "week=%~2"
  if %~2 LSS 10 set "week=0%~2"

  set /a end=week*7
  set /a start=end-6

  mkdir "week_!week!"
  echo Created folder for week !week!

  for /L %%i in (!start!,1,!end!) do (
    set "day=%%i"
    if %%i LSS 10 set "day=0%%i"

    mkdir "week_!week!\day_!day!"
    echo Created folder for day !day!
  )
)

if "%~1"=="--rename-week" (
  set "weekNum=%~2"
  set "oldWeek=week!weekNum!"

  set "newWeek=!weekNum!"
  if !weekNum! LSS 10 set "newWeek=0!weekNum!"
  set "newWeek=week_!newWeek!"

  rem If the new week folder already exists, we can skip the week rename step
  if not exist "!oldWeek!" (
    if not exist "!newWeek!" (
      echo Folder "!oldWeek!" does not exist.
      exit /b 1
    )
  )

  rem Rename the week folder if it still has the old name
  if exist "!oldWeek!" (
    if /I not "!oldWeek!"=="!newWeek!" (
      ren "!oldWeek!" "!newWeek!"
      echo Renamed "!oldWeek!" to "!newWeek!"
    )
  )

  rem Rename day folders
  for /d %%D in ("!newWeek!\day*") do (
    set "folder=%%~nxD"
    
    rem Remove "day" and any existing underscores to isolate the number
    set "day=!folder:day=!"
    set "day=!day:_=!"

    rem Strip a leading zero if it exists (e.g., "08" -> "8") to prevent "008" and octal comparison issues
    if "!day:~0,1!"=="0" set "day=!day:~1!"

    rem Perform the numerical comparison and rename accordingly
    if !day! LSS 10 (
      ren "%%D" "day_0!day!"
      echo Renamed "!folder!" to "day_0!day!"
    ) else (
      ren "%%D" "day_!day!"
      echo Renamed "!folder!" to "day_!day!"
    )
  )
)

echo Execution complete!
endlocal