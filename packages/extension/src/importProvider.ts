
import * as vscode from 'vscode';
import { findImportInsertLine } from './importUtils';

// Map of identifier → fully qualified import
export const IMPORT_MAP: Record<string, string[]> = {
  // Compose Runtime
  mutableStateOf:       ['androidx.compose.runtime.mutableStateOf'],
  mutableIntStateOf:    ['androidx.compose.runtime.mutableIntStateOf'],
  mutableLongStateOf:   ['androidx.compose.runtime.mutableLongStateOf'],
  mutableFloatStateOf:  ['androidx.compose.runtime.mutableFloatStateOf'],
  remember:             ['androidx.compose.runtime.remember'],
  rememberSaveable:     ['androidx.compose.runtime.saveable.rememberSaveable'],
  derivedStateOf:       ['androidx.compose.runtime.derivedStateOf'],
  produceState:         ['androidx.compose.runtime.produceState'],
  snapshotFlow:         ['androidx.compose.runtime.snapshotFlow'],
  LaunchedEffect:       ['androidx.compose.runtime.LaunchedEffect'],
  SideEffect:           ['androidx.compose.runtime.SideEffect'],
  DisposableEffect:     ['androidx.compose.runtime.DisposableEffect'],
  collectAsState:       ['androidx.compose.runtime.collectAsState'],
  rememberCoroutineScope: ['androidx.compose.runtime.rememberCoroutineScope'],

  // Compose Material3
  Scaffold:             ['androidx.compose.material3.Scaffold'],
  TopAppBar:            ['androidx.compose.material3.TopAppBar'],
  Text:                 ['androidx.compose.material3.Text'],
  Button:               ['androidx.compose.material3.Button'],
  TextButton:           ['androidx.compose.material3.TextButton'],
  OutlinedButton:       ['androidx.compose.material3.OutlinedButton'],
  FilledTonalButton:    ['androidx.compose.material3.FilledTonalButton'],
  ElevatedButton:       ['androidx.compose.material3.ElevatedButton'],
  IconButton:           ['androidx.compose.material3.IconButton'],
  FloatingActionButton: ['androidx.compose.material3.FloatingActionButton'],
  ExtendedFloatingActionButton: ['androidx.compose.material3.ExtendedFloatingActionButton'],
  Card:                 ['androidx.compose.material3.Card'],
  ElevatedCard:         ['androidx.compose.material3.ElevatedCard'],
  OutlinedCard:         ['androidx.compose.material3.OutlinedCard'],
  AlertDialog:          ['androidx.compose.material3.AlertDialog'],
  ModalBottomSheet:     ['androidx.compose.material3.ModalBottomSheet'],
  rememberModalBottomSheetState: ['androidx.compose.material3.rememberModalBottomSheetState'],
  NavigationBar:        ['androidx.compose.material3.NavigationBar'],
  NavigationBarItem:    ['androidx.compose.material3.NavigationBarItem'],
  OutlinedTextField:    ['androidx.compose.material3.OutlinedTextField'],
  TextField:            ['androidx.compose.material3.TextField'],
  SearchBar:            ['androidx.compose.material3.SearchBar'],
  Surface:              ['androidx.compose.material3.Surface'],
  MaterialTheme:        ['androidx.compose.material3.MaterialTheme'],
  Divider:              ['androidx.compose.material3.HorizontalDivider'],
  HorizontalDivider:    ['androidx.compose.material3.HorizontalDivider'],
  VerticalDivider:      ['androidx.compose.material3.VerticalDivider'],
  Switch:               ['androidx.compose.material3.Switch'],
  Checkbox:             ['androidx.compose.material3.Checkbox'],
  RadioButton:          ['androidx.compose.material3.RadioButton'],
  Slider:               ['androidx.compose.material3.Slider'],
  CircularProgressIndicator: ['androidx.compose.material3.CircularProgressIndicator'],
  LinearProgressIndicator:   ['androidx.compose.material3.LinearProgressIndicator'],
  AssistChip:           ['androidx.compose.material3.AssistChip'],
  FilterChip:           ['androidx.compose.material3.FilterChip'],
  SuggestionChip:       ['androidx.compose.material3.SuggestionChip'],
  DropdownMenu:         ['androidx.compose.material3.DropdownMenu'],
  DropdownMenuItem:     ['androidx.compose.material3.DropdownMenuItem'],
  Icon:                 ['androidx.compose.material3.Icon'],
  Badge:                ['androidx.compose.material3.Badge'],
  BadgedBox:            ['androidx.compose.material3.BadgedBox'],
  Snackbar:             ['androidx.compose.material3.Snackbar'],
  SnackbarHost:         ['androidx.compose.material3.SnackbarHost'],
  rememberSnackbarHostState: ['androidx.compose.material3.rememberSnackbarHostState'],
  ExperimentalMaterial3Api: ['androidx.compose.material3.ExperimentalMaterial3Api'],
  CardDefaults:         ['androidx.compose.material3.CardDefaults'],
  TextFieldDefaults:    ['androidx.compose.material3.TextFieldDefaults'],
  TopAppBarDefaults:    ['androidx.compose.material3.TopAppBarDefaults'],

  // Compose Foundation Layout
  Column:               ['androidx.compose.foundation.layout.Column'],
  Row:                  ['androidx.compose.foundation.layout.Row'],
  Box:                  ['androidx.compose.foundation.layout.Box'],
  Spacer:               ['androidx.compose.foundation.layout.Spacer'],
  fillMaxSize:          ['androidx.compose.foundation.layout.fillMaxSize'],
  fillMaxWidth:         ['androidx.compose.foundation.layout.fillMaxWidth'],
  fillMaxHeight:        ['androidx.compose.foundation.layout.fillMaxHeight'],
  padding:              ['androidx.compose.foundation.layout.padding'],
  PaddingValues:        ['androidx.compose.foundation.layout.PaddingValues'],
  Arrangement:          ['androidx.compose.foundation.layout.Arrangement'],
  WindowInsets:         ['androidx.compose.foundation.layout.WindowInsets'],

  // Compose Foundation Lazy
  LazyColumn:           ['androidx.compose.foundation.lazy.LazyColumn'],
  LazyRow:              ['androidx.compose.foundation.lazy.LazyRow'],
  LazyVerticalGrid:     ['androidx.compose.foundation.lazy.grid.LazyVerticalGrid'],
  GridCells:            ['androidx.compose.foundation.lazy.grid.GridCells'],
  LazyVerticalStaggeredGrid: ['androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid'],
  StaggeredGridCells:   ['androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells'],

  // Compose UI
  Modifier:             ['androidx.compose.ui.Modifier'],
  Alignment:            ['androidx.compose.ui.Alignment'],
  Color:                ['androidx.compose.ui.graphics.Color'],
  dp:                   ['androidx.compose.ui.unit.dp'],
  sp:                   ['androidx.compose.ui.unit.sp'],
  TextStyle:            ['androidx.compose.ui.text.TextStyle'],
  FontWeight:           ['androidx.compose.ui.text.font.FontWeight'],
  TextOverflow:         ['androidx.compose.ui.text.style.TextOverflow'],
  TextAlign:            ['androidx.compose.ui.text.style.TextAlign'],
  KeyboardOptions:      ['androidx.compose.foundation.text.KeyboardOptions'],
  KeyboardActions:      ['androidx.compose.foundation.text.KeyboardActions'],
  KeyboardType:         ['androidx.compose.ui.text.input.KeyboardType'],
  ImeAction:            ['androidx.compose.ui.text.input.ImeAction'],
  PasswordVisualTransformation: ['androidx.compose.ui.text.input.PasswordVisualTransformation'],
  LocalContext:         ['androidx.compose.ui.platform.LocalContext'],
  LocalFocusManager:    ['androidx.compose.ui.platform.LocalFocusManager'],

  // Icons
  Icons:                ['androidx.compose.material.icons.Icons'],
  'Icons.Default':      ['androidx.compose.material.icons.Icons'],
  'Icons.Outlined':     ['androidx.compose.material.icons.Icons', 'androidx.compose.material.icons.outlined.*'],
  'Icons.Rounded':      ['androidx.compose.material.icons.Icons', 'androidx.compose.material.icons.rounded.*'],

  // Animation
  AnimatedVisibility:   ['androidx.compose.animation.AnimatedVisibility'],
  animateContentSize:   ['androidx.compose.animation.animateContentSize'],
  Crossfade:            ['androidx.compose.animation.Crossfade'],
  AnimatedContent:      ['androidx.compose.animation.AnimatedContent'],
  animateFloatAsState:  ['androidx.compose.animation.core.animateFloatAsState'],
  animateDpAsState:     ['androidx.compose.animation.core.animateDpAsState'],
  animateColorAsState:  ['androidx.compose.animation.core.animateColorAsState'],

  // Navigation
  NavController:        ['androidx.navigation.NavController'],
  NavHost:              ['androidx.navigation.compose.NavHost'],
  rememberNavController: ['androidx.navigation.compose.rememberNavController'],
  NavBackStackEntry:    ['androidx.navigation.NavBackStackEntry'],

  // ViewModel / Lifecycle
  ViewModel:            ['androidx.lifecycle.ViewModel'],
  viewModel:            ['androidx.lifecycle.viewmodel.compose.viewModel'],
  viewModelScope:       ['androidx.lifecycle.viewModelScope'],
  AndroidViewModel:     ['androidx.lifecycle.AndroidViewModel'],
  LiveData:             ['androidx.lifecycle.LiveData'],
  MutableLiveData:      ['androidx.lifecycle.MutableLiveData'],
  observeAsState:       ['androidx.compose.runtime.livedata.observeAsState'],

  // Coroutines / Flow
  StateFlow:            ['kotlinx.coroutines.flow.StateFlow'],
  MutableStateFlow:     ['kotlinx.coroutines.flow.MutableStateFlow'],
  Flow:                 ['kotlinx.coroutines.flow.Flow'],
  SharedFlow:           ['kotlinx.coroutines.flow.SharedFlow'],
  MutableSharedFlow:    ['kotlinx.coroutines.flow.MutableSharedFlow'],
  asStateFlow:          ['kotlinx.coroutines.flow.asStateFlow'],
  asSharedFlow:         ['kotlinx.coroutines.flow.asSharedFlow'],
  combine:              ['kotlinx.coroutines.flow.combine'],
  map:                  ['kotlinx.coroutines.flow.map'],
  filter:               ['kotlinx.coroutines.flow.filter'],
  stateIn:              ['kotlinx.coroutines.flow.stateIn'],
  SharingStarted:       ['kotlinx.coroutines.flow.SharingStarted'],
  Dispatchers:          ['kotlinx.coroutines.Dispatchers'],
  withContext:          ['kotlinx.coroutines.withContext'],
  launch:               ['kotlinx.coroutines.launch'],
  async:                ['kotlinx.coroutines.async'],
  CoroutineScope:       ['kotlinx.coroutines.CoroutineScope'],

  // Room
  Entity:               ['androidx.room.Entity'],
  PrimaryKey:           ['androidx.room.PrimaryKey'],
  ColumnInfo:           ['androidx.room.ColumnInfo'],
  Dao:                  ['androidx.room.Dao'],
  Query:                ['androidx.room.Query'],
  Insert:               ['androidx.room.Insert'],
  Delete:               ['androidx.room.Delete'],
  Update:               ['androidx.room.Update'],
  OnConflictStrategy:   ['androidx.room.OnConflictStrategy'],
  Database:             ['androidx.room.Database'],
  RoomDatabase:         ['androidx.room.RoomDatabase'],
  Room:                 ['androidx.room.Room'],

  // Hilt
  HiltViewModel:        ['dagger.hilt.android.lifecycle.HiltViewModel'],
  HiltAndroidApp:       ['dagger.hilt.android.HiltAndroidApp'],
  AndroidEntryPoint:    ['dagger.hilt.android.AndroidEntryPoint'],
  Inject:               ['javax.inject.Inject'],
  Provides:             ['dagger.Provides'],
  Singleton:            ['javax.inject.Singleton'],
  Module:               ['dagger.Module'],
  InstallIn:            ['dagger.hilt.InstallIn'],
  SingletonComponent:   ['dagger.hilt.components.SingletonComponent'],

  // Coil / Image
  AsyncImage:           ['coil.compose.AsyncImage'],
  rememberAsyncImagePainter: ['coil.compose.rememberAsyncImagePainter'],

  // Accompanist
  rememberPermissionState: ['com.google.accompanist.permissions.rememberPermissionState'],
  rememberMultiplePermissionsState: ['com.google.accompanist.permissions.rememberMultiplePermissionsState'],
};

/**
 * CompletionItemProvider that offers to add missing Kotlin/Compose imports.
 * Triggers when user types a known identifier in a .kt file.
 */
export class ImportCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] {
    const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);
    if (!wordRange) { return []; }
    const word = document.getText(wordRange);

    const imports = IMPORT_MAP[word];
    if (!imports) { return []; }

    const existingText = document.getText();
    const items: vscode.CompletionItem[] = [];

    for (const imp of imports) {
      // Skip if already imported
      if (existingText.includes(`import ${imp}`)) { continue; }

      const item = new vscode.CompletionItem(
        `import ${imp}`,
        vscode.CompletionItemKind.Module,
      );
      item.detail = 'JetStart: add import';
      item.documentation = new vscode.MarkdownString(
        `Adds \`import ${imp}\` to the top of the file.`,
      );

      // Insert the import after the last existing import, or after package line
      const insertLine = findImportInsertLine(document);
      item.additionalTextEdits = [
        vscode.TextEdit.insert(
          new vscode.Position(insertLine, 0),
          `import ${imp}\n`,
        ),
      ];

      // Keep original word — don't replace it
      item.insertText = '';
      item.filterText = word;
      item.sortText = '0' + word; // sort to top
    items.push(item);
    }

    return items;
  }
}
