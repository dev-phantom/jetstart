// JetStart Snippet Definitions
// Each snippet has:
//   prefix   - what the user types (like ktc, ktvm, ktcf …)
//   label    - shown in autocomplete dropdown
//   detail   - right-side annotation in the dropdown
//   body()   - function receiving context; returns the snippet string
//              $1, $2 … are tab stops; \${1:placeholder} has default text
//              pkgLine is "package com.example.app.ui\n\n" or "" if file

//              already declares its own package

export interface SnippetContext {
  className: string;     // suggested class name from file name
}

export interface SnippetDef {
  prefix: string;
  label: string;
  detail: string;
  body: (ctx: SnippetContext) => string;
  documentation: string;
  imports?: string[];
}

// helpers
const OPT = (annotation: string) =>
  `@OptIn(ExperimentalMaterial3Api::class)
${annotation}`;

// all snippets
export const SNIPPETS: SnippetDef[] = [

  // Classes
  {
    prefix: 'ktc',
    label: 'ktc — Kotlin Class',
    detail: 'class ${Name} { }',
    documentation: 'Creates a Kotlin class.',
    body: ({ className }) =>
`class \${1:${className}} {
    \${0:// TODO}
}`,
  },

  {
    prefix: 'ktdc',
    label: 'ktdc — Data Class',
    detail: 'data class ${Name}(...)',
    documentation: 'Creates a Kotlin data class.',
    body: ({ className }) =>
`data class \${1:${className}}(
    val \${2:id}: \${3:Int},
    val \${4:name}: \${5:String},
) {\${0}}`,
  },

  {
    prefix: 'ktsc',
    label: 'ktsc — Sealed Class',
    detail: 'sealed class ${Name}',
    documentation: 'Creates a Kotlin sealed class with common subclasses.',
    body: ({ className }) =>
`sealed class \${1:${className}} {
    data class Success(val \${2:data}: \${3:Any}) : \${1:${className}}()
    data class Error(val \${4:message}: String) : \${1:${className}}()
    object Loading : \${1:${className}}()
}\${0}`,
  },

  {
    prefix: 'ktec',
    label: 'ktec — Enum Class',
    detail: 'enum class ${Name}',
    documentation: 'Creates a Kotlin enum class.',
    body: ({ className }) =>
`enum class \${1:${className}} {
    \${2:OPTION_ONE},
    \${3:OPTION_TWO},
    \${4:OPTION_THREE},
}
\${0}`,
  },

  {
    prefix: 'ktobj',
    label: 'ktobj — Object',
    detail: 'object ${Name} { }',
    documentation: 'Creates a Kotlin singleton object.',
    body: ({ className }) =>
`object \${1:${className}} {
    \${0:// TODO}
}`,
  },

  {
    prefix: 'ktint',
    label: 'ktint — Interface',
    detail: 'interface ${Name} { }',
    documentation: 'Creates a Kotlin interface.',
    body: ({ className }) =>
`interface \${1:${className}} {
    \${0:// TODO}
}`,
  },

  {
    prefix: 'ktabsc',
    label: 'ktabsc — Abstract Class',
    detail: 'abstract class ${Name}',
    documentation: 'Creates a Kotlin abstract class.',
    body: ({ className }) =>
`abstract class \${1:${className}} {
    abstract fun \${2:method}(): \${3:Unit}
    \${0}
}`,
  },

  // Android Architecture
  {
    prefix: 'ktvm',
    label: 'ktvm — ViewModel',
    detail: 'class ${Name}ViewModel : ViewModel()',
    documentation: 'Creates a ViewModel with StateFlow and coroutine scope.',
    imports: [
      'androidx.lifecycle.ViewModel',
      'androidx.lifecycle.viewModelScope',
      'kotlinx.coroutines.flow.MutableStateFlow',
      'kotlinx.coroutines.flow.StateFlow',
      'kotlinx.coroutines.flow.asStateFlow',
      'kotlinx.coroutines.launch',
    ],
    body: ({ className }) =>
`class \${1:${className}}ViewModel : ViewModel() {

    private val _\${2:state} = MutableStateFlow<\${3:String}>(\${4:""})
    val \${2:state}: StateFlow<\${3:String}> = _\${2:state}.asStateFlow()

    fun \${5:loadData}() {
        viewModelScope.launch {
            \${0:// TODO}
        }
    }
}`,
  },

  {
    prefix: 'ktrep',
    label: 'ktrep — Repository',
    detail: 'class ${Name}Repository',
    documentation: 'Creates a Repository class with suspend functions.',
    imports: ['kotlinx.coroutines.flow.Flow'],
    body: ({ className }) =>
`class \${1:${className}}Repository(
    private val \${2:dao}: \${3:${className}Dao},
) {

    fun getAll(): Flow<List<\${4:${className}}>> = \${2:dao}.\${5:getAll}()

    suspend fun insert(\${6:item}: \${4:${className}}) {
        \${2:dao}.\${7:insert}(\${6:item})
    }

    suspend fun delete(\${6:item}: \${4:${className}}) {
        \${2:dao}.\${8:delete}(\${6:item})
    }

    \${0}
}`,
  },

  // Room
  {
    prefix: 'ktent',
    label: 'ktent — Room Entity',
    detail: '@Entity data class ${Name}',
    documentation: 'Creates a Room database entity.',
    imports: [
      'androidx.room.Entity',
      'androidx.room.PrimaryKey',
    ],
    body: ({ className }) =>
`@Entity(tableName = "\${2:${className.toLowerCase()}s}")
data class \${1:${className}}(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val \${3:name}: \${4:String},
    val \${5:createdAt}: Long = System.currentTimeMillis(),
)
\${0}`,
  },

  {
    prefix: 'ktdao',
    label: 'ktdao — Room DAO',
    detail: '@Dao interface ${Name}Dao',
    documentation: 'Creates a Room DAO interface.',
    imports: [
      'androidx.room.*',
      'kotlinx.coroutines.flow.Flow',
    ],
    body: ({ className }) =>
`@Dao
interface \${1:${className}}Dao {

    @Query("SELECT * FROM \${2:${className.toLowerCase()}s} ORDER BY id DESC")
    fun getAll(): Flow<List<\${1:${className}}>>

    @Query("SELECT * FROM \${2:${className.toLowerCase()}s} WHERE id = :id")
    suspend fun getById(id: Int): \${1:${className}}?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: \${1:${className}})

    @Delete
    suspend fun delete(item: \${1:${className}})

    @Update
    suspend fun update(item: \${1:${className}})
    
    \${0}
}`,
  },

  {
    prefix: 'ktdb',
    label: 'ktdb — Room Database',
    detail: '@Database abstract class ${Name}Database',
    documentation: 'Creates a Room Database abstract class.',
    imports: [
      'android.content.Context',
      'androidx.room.Database',
      'androidx.room.Room',
      'androidx.room.RoomDatabase',
    ],
    body: ({ className }) =>
`@Database(
    entities = [\${1:${className}}::class],
    version = \${2:1},
    exportSchema = false,
)
abstract class \${3:${className}}Database : RoomDatabase() {

    abstract fun \${4:${className.toLowerCase()}}Dao(): \${1:${className}}Dao

    companion object {
        @Volatile private var INSTANCE: \${3:${className}}Database? = null

        fun getDatabase(context: Context): \${3:${className}}Database =
            INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    \${3:${className}}Database::class.java,
                    "\${5:${className.toLowerCase()}_database}",
                ).build().also { INSTANCE = it }
            }
    }
}
\${0}`,
  },

  // Composable Functions
  {
    prefix: 'ktcf',
    label: 'ktcf — Composable Function',
    detail: '@Composable fun ${Name}()',
    documentation: 'Creates a Composable function.',
    imports: ['androidx.compose.runtime.Composable'],
    body: () =>
`@Composable
fun \${1:MyScreen}(\${2}) {
    \${0}
}`,
  },

  {
    prefix: 'ktcfs',
    label: 'ktcfs — Composable with State',
    detail: '@Composable fun ${Name}() + remember state',
    documentation: 'Creates a Composable function with local state using remember.',
    imports: ['androidx.compose.runtime.*'],
    body: () =>
`@Composable
fun \${1:MyScreen}(\${2}) {
    var \${3:value} by remember { mutableStateOf(\${4:""}) }

    \${0}
}`,
  },

  {
    prefix: 'ktprev',
    label: 'ktprev — Composable Preview',
    detail: '@Preview @Composable fun ${Name}Preview()',
    documentation: 'Creates a Composable preview function.',
    imports: [
      'androidx.compose.runtime.Composable',
      'androidx.compose.ui.tooling.preview.Preview',
    ],
    body: () =>
`@Preview(showBackground = true)
@Composable
fun \${1:MyScreen}Preview() {
    \${1:MyScreen}(\${2})
}`,
  },

  // Compose UI Blocks
  {
    prefix: 'ktscaffold',
    label: 'ktscaffold — Scaffold',
    detail: 'Scaffold { ... }',
    documentation: 'Full Material3 Scaffold with TopAppBar and FAB.',
    imports: [
      'androidx.compose.material3.*',
      'androidx.compose.material.icons.Icons',
      'androidx.compose.material.icons.filled.Add',
      'androidx.compose.ui.Modifier',
    ],
    body: () =>
`${OPT('@Composable')}
fun \${1:MyScreen}() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("\${2:Title}") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { \${3} }) {
                Icon(Icons.Default.\${4:Add}, contentDescription = "\${5:Action}")
            }
        },
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            \${0}
        }
    }
}`,
  },

  {
    prefix: 'ktlazycol',
    label: 'ktlazycol — LazyColumn',
    detail: 'LazyColumn { items(...) }',
    documentation: 'LazyColumn with items block.',
    body: () =>
`LazyColumn(
    contentPadding = PaddingValues(\${1:16}.dp),
    verticalArrangement = Arrangement.spacedBy(\${2:8}.dp),
    modifier = Modifier.fillMaxSize(),
) {
    items(\${3:items}) { \${4:item} ->
        \${0}
    }
}`,
  },

  {
    prefix: 'ktlazyr',
    label: 'ktlazyr — LazyRow',
    detail: 'LazyRow { items(...) }',
    documentation: 'LazyRow with items block.',
    body: () =>
`LazyRow(
    contentPadding = PaddingValues(horizontal = \${1:16}.dp),
    horizontalArrangement = Arrangement.spacedBy(\${2:8}.dp),
) {
    items(\${3:items}) { \${4:item} ->
        \${0}
    }
}`,
  },

  {
    prefix: 'ktlazysgrid',
    label: 'ktlazysgrid — LazyVerticalStaggeredGrid',
    detail: 'LazyVerticalStaggeredGrid { items(...) }',
    documentation: 'Staggered grid layout.',
    body: () =>
`LazyVerticalStaggeredGrid(
    columns = StaggeredGridCells.Fixed(\${1:2}),
    contentPadding = PaddingValues(\${2:16}.dp),
    horizontalArrangement = Arrangement.spacedBy(\${3:12}.dp),
    verticalItemSpacing = \${4:12}.dp,
    modifier = Modifier.fillMaxSize(),
) {
    items(\${5:items}) { \${6:item} ->
        \${0}
    }
}`,
  },

  {
    prefix: 'ktcard',
    label: 'ktcard — Card',
    detail: 'Card { Column { ... } }',
    documentation: 'Material3 Card with Column content.',
    body: () =>
`Card(
    colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.\${1:surfaceVariant},
    ),
    shape = MaterialTheme.shapes.\${2:medium},
    modifier = Modifier.\${3:fillMaxWidth()},
) {
    Column(modifier = Modifier.padding(\${4:16}.dp)) {
        \${0}
    }
}`,
  },

  {
    prefix: 'ktrow',
    label: 'ktrow — Row',
    detail: 'Row(horizontalArrangement, verticalAlignment)',
    documentation: 'Row layout composable.',
    body: () =>
`Row(
    horizontalArrangement = Arrangement.\${1:spacedBy(8.dp)},
    verticalAlignment = Alignment.\${2:CenterVertically},
    modifier = Modifier.\${3:fillMaxWidth()},
) {
    \${0}
}`,
  },

  {
    prefix: 'ktcol',
    label: 'ktcol — Column',
    detail: 'Column(verticalArrangement, horizontalAlignment)',
    documentation: 'Column layout composable.',
    body: () =>
`Column(
    verticalArrangement = Arrangement.\${1:spacedBy(8.dp)},
    horizontalAlignment = Alignment.\${2:CenterHorizontally},
    modifier = Modifier.\${3:fillMaxSize()},
) {
    \${0}
}`,
  },

  {
    prefix: 'ktalertd',
    label: 'ktalertd — AlertDialog',
    detail: 'AlertDialog { ... }',
    documentation: 'Material3 AlertDialog.',
    body: () =>
`AlertDialog(
    onDismissRequest = \${1:onDismiss},
    title = { Text("\${2:Title}") },
    text = {
        \${0}
    },
    confirmButton = {
        Button(onClick = \${3:onConfirm}) {
            Text("\${4:Confirm}")
        }
    },
    dismissButton = {
        TextButton(onClick = \${1:onDismiss}) {
            Text("\${5:Cancel}")
        }
    },
)`,
  },

  {
    prefix: 'ktbottomsheet',
    label: 'ktbottomsheet — ModalBottomSheet',
    detail: 'ModalBottomSheet { ... }',
    documentation: 'Material3 ModalBottomSheet.',
    imports: [
      'androidx.compose.material3.*',
      'androidx.compose.runtime.*',
      'androidx.compose.ui.unit.dp',
    ],
    body: () =>
`${OPT('val sheetState = rememberModalBottomSheetState()')}
var showSheet by remember { mutableStateOf(false) }

if (showSheet) {
    ModalBottomSheet(
        onDismissRequest = { showSheet = false },
        sheetState = sheetState,
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            \${0}
        }
    }
}`,
  },

  {
    prefix: 'kttab',
    label: 'kttab — TopAppBar',
    detail: '@OptIn TopAppBar { ... }',
    documentation: 'Material3 TopAppBar.',
    imports: [
      'androidx.compose.material3.*',
      'androidx.compose.material.icons.Icons',
      'androidx.compose.material.icons.filled.ArrowBack',
    ],
    body: () =>
`${OPT('TopAppBar(')}
    title = { Text("\${1:Title}") },
    navigationIcon = {
        \${2:IconButton(onClick = \${3:onBack}) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
        }}
    },
    actions = {
        \${0}
    },
)`,
  },

  {
    prefix: 'ktnav',
    label: 'ktnav — NavHost Setup',
    detail: 'NavHost with composable routes',
    documentation: 'Sets up a NavHost with multiple composable routes.',
    imports: [
      'androidx.compose.runtime.Composable',
      'androidx.navigation.compose.NavHost',
      'androidx.navigation.compose.composable',
      'androidx.navigation.compose.rememberNavController',
    ],
    body: () =>
`@Composable
fun \${1:AppNavigation}() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "\${2:home}",
    ) {
        composable("\${2:home}") {
            \${3:HomeScreen}(navController = navController)
        }
        composable("\${4:detail}/{id}") { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id")
            \${5:DetailScreen}(id = id, navController = navController)
        }
        \${0}
    }
}`,
  },

  // State & Flow
  {
    prefix: 'ktstate',
    label: 'ktstate — remember mutableStateOf',
    detail: 'var x by remember { mutableStateOf(...) }',
    documentation: 'Creates a remembered mutable state variable.',
    body: () =>
`var \${1:value} by remember { mutableStateOf(\${2:""}) }\${0}`,
  },

  {
    prefix: 'ktsflow',
    label: 'ktsflow — StateFlow pair',
    detail: 'private _x MutableStateFlow + x StateFlow',
    documentation: 'Creates a private MutableStateFlow and its public StateFlow.',
    body: () =>
`private val _\${1:state} = MutableStateFlow<\${2:String}>(\${3:""})
val \${1:state}: StateFlow<\${2:String}> = _\${1:state}.asStateFlow()\${0}`,
  },

  {
    prefix: 'ktcollect',
    label: 'ktcollect — collectAsState',
    detail: 'val x by flow.collectAsState()',
    documentation: 'Collects a Flow/StateFlow as Compose state.',
    body: () =>
`val \${1:value} by \${2:viewModel}.\${3:state}.collectAsState()\${0}`,
  },

  {
    prefix: 'ktlaunch',
    label: 'ktlaunch — LaunchedEffect',
    detail: 'LaunchedEffect(key) { }',
    documentation: 'Creates a LaunchedEffect with a key.',
    body: () =>
`LaunchedEffect(\${1:key1}) {
    \${0}
}`,
  },

  {
    prefix: 'ktsideef',
    label: 'ktsideef — SideEffect',
    detail: 'SideEffect { }',
    documentation: 'Creates a SideEffect block.',
    body: () =>
`SideEffect {
    \${0}
}`,
  },

  {
    prefix: 'ktdisposable',
    label: 'ktdisposable — DisposableEffect',
    detail: 'DisposableEffect(key) { onDispose { } }',
    documentation: 'Creates a DisposableEffect with cleanup.',
    body: () =>
`DisposableEffect(\${1:key1}) {
    \${2:// setup}
    onDispose {
        \${0:// cleanup}
    }
}`,
  },

  {
    prefix: 'ktderived',
    label: 'ktderived — derivedStateOf',
    detail: 'val x by remember { derivedStateOf { } }',
    documentation: 'Creates a derived state that only recomposes when result changes.',
    body: () =>
`val \${1:derived} by remember {
    derivedStateOf { \${0} }
}`,
  },

  // Coroutines
  {
    prefix: 'ktcoro',
    label: 'ktcoro — viewModelScope.launch',
    detail: 'viewModelScope.launch { }',
    documentation: 'Launches a coroutine in viewModelScope.',
    body: () =>
`viewModelScope.launch {
    \${0}
}`,
  },

  {
    prefix: 'ktio',
    label: 'ktio — withContext IO',
    detail: 'withContext(Dispatchers.IO) { }',
    documentation: 'Runs a block on the IO dispatcher.',
    body: () =>
`withContext(Dispatchers.IO) {
    \${0}
}`,
  },

  {
    prefix: 'ktasync',
    label: 'ktasync — async/await',
    detail: 'val x = async { }.await()',
    documentation: 'Creates an async deferred value and awaits it.',
    body: () =>
`val \${1:result} = async {
    \${0}
}.await()`,
  },

  //  Functions 
  {
    prefix: 'ktfun',
    label: 'ktfun — Function',
    detail: 'fun name(): ReturnType { }',
    documentation: 'Creates a Kotlin function.',
    body: () =>
`fun \${1:functionName}(\${2}): \${3:Unit} {
    \${0}
}`,
  },

  {
    prefix: 'ktsfun',
    label: 'ktsfun — Suspend Function',
    detail: 'suspend fun name(): ReturnType { }',
    documentation: 'Creates a Kotlin suspend function.',
    body: () =>
`suspend fun \${1:functionName}(\${2}): \${3:Unit} {
    \${0}
}`,
  },

  {
    prefix: 'ktef',
    label: 'ktef — Extension Function',
    detail: 'fun Type.name(): ReturnType { }',
    documentation: 'Creates a Kotlin extension function.',
    body: () =>
`fun \${1:String}.\${2:extensionName}(\${3}): \${4:Unit} {
    \${0}
}`,
  },

  {
    prefix: 'ktlambda',
    label: 'ktlambda — Lambda',
    detail: 'val name: (Type) -> ReturnType = { }',
    documentation: 'Creates a Kotlin lambda.',
    body: () =>
`val \${1:name}: (\${2:String}) -> \${3:Unit} = { \${4:it} ->
    \${0}
}`,
  },

  // Control Flow
  {
    prefix: 'ktwhen',
    label: 'ktwhen — when expression',
    detail: 'when (x) { ... }',
    documentation: 'Creates a Kotlin when expression.',
    body: () =>
`when (\${1:value}) {
    \${2:condition1} -> \${3}
    \${4:condition2} -> \${5}
    else -> \${0}
}`,
  },

  {
    prefix: 'ktwhenresult',
    label: 'ktwhenresult — when Result',
    detail: 'when (result) { is Success -> ... }',
    documentation: 'Handles a sealed Result class with when.',
    body: () =>
`when (val result = \${1:result}) {
    is \${2:UiState}.Loading -> \${3:LoadingView()}
    is \${2:UiState}.Success -> \${4:SuccessView(result.data)}
    is \${2:UiState}.Error -> \${0:ErrorView(result.message)}
}`,
  },

  // Hilt
  {
    prefix: 'kthiltvm',
    label: 'kthiltvm — Hilt ViewModel',
    detail: '@HiltViewModel class ${Name}ViewModel @Inject',
    documentation: 'Creates a Hilt-injected ViewModel.',
    imports: [
      'androidx.lifecycle.ViewModel',
      'androidx.lifecycle.viewModelScope',
      'dagger.hilt.android.lifecycle.HiltViewModel',
      'kotlinx.coroutines.flow.MutableStateFlow',
      'kotlinx.coroutines.flow.StateFlow',
      'kotlinx.coroutines.flow.asStateFlow',
      'kotlinx.coroutines.launch',
      'javax.inject.Inject',
    ],
    body: ({ className }) =>
`@HiltViewModel
class \${1:${className}}ViewModel @Inject constructor(
    private val \${2:repository}: \${3:${className}Repository},
) : ViewModel() {

    private val _\${4:state} = MutableStateFlow<\${5:String}>(\${6:""})
    val \${4:state}: StateFlow<\${5:String}> = _\${4:state}.asStateFlow()

    fun \${7:loadData}() {
        viewModelScope.launch {
            \${0:// TODO}
        }
    }
}`,
  },

];
