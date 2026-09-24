# Тренажёр Livecode в PowerShell: шпаргалка при входе в папку и Tab-дополнение для yarn.
#
# Подключается одной строкой в $PROFILE:
#   . "E:\Projects\Frontend\Practice\Livecode\scripts\shell\livecode.ps1"
#
# Tab после `yarn ` предлагает скрипты тренажёра, после `yarn go ` / `ok` / `how` / `task` /
# `clean` / `watch` — коды задач и паков. Вне папки тренажёра yarn дополняется как обычно.

$global:LivecodeRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$global:LivecodeTaskCache = $null

# ── Tab-дополнение ──────────────────────────────────────────────────────

$global:LivecodeHints = @{
	'menu'     = 'меню стрелками'
	'start'    = 'меню стрелками'
	'go'       = 'открыть задачу в VS Code'
	'solve'    = 'открыть задачу в VS Code'
	'ok'       = 'проверить задачу'
	'how'      = 'разбор решения по шагам'
	'explain'  = 'разбор решения по шагам'
	'task'     = 'список паков / карточка задачи'
	'progress' = 'полный прогон и таблица'
	'clean'    = 'сбросить решения к заготовкам'
	'watch'    = 'держать тесты задачи запущенными'
	'verify'   = 'самопроверка тренажёра'
	'test'     = 'сырой vitest один раз'
	't'        = 'сырой vitest в watch'
}

# Команды, которые принимают код задачи или пака, и их флаги.
$global:LivecodeTaskCommands = @{
	'go'      = @('-n', '--check')
	'solve'   = @('-n', '--check')
	'ok'      = @('--all', '-v')
	'how'     = @()
	'explain' = @()
	'task'    = @('-c', '-s', '--all')
	'clean'   = @('--all', '--done', '--dry', '-y')
	'watch'   = @()
	'progress' = @()
}

function global:Get-LivecodeTasks {
	# Коды берутся из имён файлов задач: быстро и без запуска node.
	if ($null -eq $global:LivecodeTaskCache) {
		$ids = Get-ChildItem -Path (Join-Path $global:LivecodeRoot 'src\drills\*\tasks\*') -File -ErrorAction SilentlyContinue |
			Where-Object { $_.Name -notlike '_*' } |
			ForEach-Object { $_.BaseName.ToUpper() }
		$packs = $ids | ForEach-Object { ($_ -split '-')[0] } | Sort-Object -Unique
		$global:LivecodeTaskCache = @($packs) + @($ids | Sort-Object)
	}
	return $global:LivecodeTaskCache
}

Register-ArgumentCompleter -Native -CommandName yarn -ScriptBlock {
	param($wordToComplete, $commandAst, $cursorPosition)

	# Только внутри тренажёра — в чужих проектах yarn не трогаем.
	$here = (Get-Location).Path
	if (-not $here.StartsWith($global:LivecodeRoot, [System.StringComparison]::OrdinalIgnoreCase)) { return }

	$words = @($commandAst.CommandElements | ForEach-Object { $_.ToString() })
	# Дописываемое слово уже в списке; новое пустое слово — ещё нет.
	$position = if ($wordToComplete) { $words.Count - 1 } else { $words.Count }

	if ($position -eq 1) {
		$package = Get-Content (Join-Path $global:LivecodeRoot 'package.json') -Raw | ConvertFrom-Json
		$package.scripts.PSObject.Properties.Name |
			Where-Object { $_ -like "$wordToComplete*" } |
			ForEach-Object {
				$hint = $global:LivecodeHints[$_]
				if (-not $hint) { $hint = $package.scripts.$_ }
				[System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $hint)
			}
		return
	}

	if ($position -ge 2) {
		$command = $words[1]
		if (-not $global:LivecodeTaskCommands.ContainsKey($command)) { return }

		$candidates = if ($wordToComplete.StartsWith('-')) { $global:LivecodeTaskCommands[$command] } else { Get-LivecodeTasks }
		$candidates |
			Where-Object { $_ -like "$wordToComplete*" } |
			ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
	}
}

# ── шпаргалка при входе в папку ────────────────────────────────────────

$global:LivecodeLastDir = $null
$global:LivecodeOriginalPrompt = $function:prompt

function global:prompt {
	$here = (Get-Location).Path
	if ($here -ne $global:LivecodeLastDir) {
		$global:LivecodeLastDir = $here
		# Только сама папка тренажёра: в подпапках шпаргалка была бы шумом.
		if ($here -eq $global:LivecodeRoot -and (Get-Command node -ErrorAction SilentlyContinue)) {
			# Не просто `node ...`: внутри prompt вывод попал бы в возвращаемое значение,
			# PowerShell получил бы массив вместо строки и показал запасное «PS>».
			# Start-Process пишет прямо в консоль и ничего не возвращает.
			$hello = Join-Path $global:LivecodeRoot 'scripts\hello.mjs'
			Start-Process -FilePath node -ArgumentList ('"' + $hello + '"') -NoNewWindow -Wait
		}
	}
	& $global:LivecodeOriginalPrompt
}
