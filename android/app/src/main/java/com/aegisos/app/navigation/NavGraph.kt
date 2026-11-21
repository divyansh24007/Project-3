package com.aegisos.app.navigation

import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.aegisos.app.ui.screens.AppGuardScreen
import com.aegisos.app.ui.screens.GuardHubScreen
import com.aegisos.app.ui.screens.HomeScreen
import com.aegisos.app.ui.screens.InvestigationsScreen
import com.aegisos.app.ui.screens.MediaGuardScreen
import com.aegisos.app.ui.screens.MessageGuardScreen
import com.aegisos.app.ui.screens.NetworkGuardScreen
import com.aegisos.app.ui.screens.ScannerScreen
import com.aegisos.app.ui.screens.SettingsScreen
import com.aegisos.app.ui.screens.WebGuardScreen
import com.aegisos.app.ui.theme.AegisCyan
import com.aegisos.app.ui.theme.Card
import com.aegisos.app.ui.theme.Surface
import com.aegisos.app.ui.theme.TextMuted
import com.aegisos.app.ui.theme.TextPrimary

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Scanner : Screen("scanner")
    data object WebGuard : Screen("web_guard")
    data object MessageGuard : Screen("message_guard")
    data object MediaGuard : Screen("media_guard")
    data object AppGuard : Screen("app_guard")
    data object NetworkGuard : Screen("network_guard")
    data object Investigations : Screen("investigations")
    data object Settings : Screen("settings")
    data object Guard : Screen("guard")
}

sealed class BottomNavItem(
    val title: String,
    val route: String,
    val icon: ImageVector
) {
    data object Home : BottomNavItem("Home", Screen.Home.route, Icons.Default.Home)
    data object Scanner : BottomNavItem("Scanner", Screen.Scanner.route, Icons.Default.QrCodeScanner)
    data object Guard : BottomNavItem("Guard", Screen.Guard.route, Icons.Default.Shield)
    data object History : BottomNavItem("History", Screen.Investigations.route, Icons.Default.History)
    data object Settings : BottomNavItem("Settings", Screen.Settings.route, Icons.Default.Settings)
}

val bottomNavItems = listOf(
    BottomNavItem.Home,
    BottomNavItem.Scanner,
    BottomNavItem.Guard,
    BottomNavItem.History,
    BottomNavItem.Settings
)

@Composable
fun AegisosNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    sharedText: String? = null,
    sharedUris: List<Uri> = emptyList()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val guardRoutes = listOf(
        Screen.Guard.route,
        Screen.WebGuard.route,
        Screen.MessageGuard.route,
        Screen.MediaGuard.route,
        Screen.AppGuard.route,
        Screen.NetworkGuard.route
    )

    val isBottomBarVisible = bottomNavItems.any { it.route == currentRoute } || currentRoute in guardRoutes

    Scaffold(
        modifier = modifier,
        bottomBar = {
            if (isBottomBarVisible) {
                AegisosBottomNavigationBar(
                    items = bottomNavItems,
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigateToScanner = { navController.navigate(Screen.Scanner.route) },
                    onNavigateToModule = { moduleId ->
                        when (moduleId) {
                            "web" -> navController.navigate(Screen.WebGuard.route)
                            "msg" -> navController.navigate(Screen.MessageGuard.route)
                            "media" -> navController.navigate(Screen.MediaGuard.route)
                            "app" -> navController.navigate(Screen.AppGuard.route)
                            "net" -> navController.navigate(Screen.NetworkGuard.route)
                            else -> navController.navigate(Screen.Guard.route)
                        }
                    },
                    onQuickScanClick = { navController.navigate(Screen.Scanner.route) }
                )
            }

            composable(Screen.Scanner.route) {
                ScannerScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Guard.route) {
                GuardHubScreen(
                    onNavigateToWebGuard = { navController.navigate(Screen.WebGuard.route) },
                    onNavigateToMessageGuard = { navController.navigate(Screen.MessageGuard.route) },
                    onNavigateToMediaGuard = { navController.navigate(Screen.MediaGuard.route) },
                    onNavigateToAppGuard = { navController.navigate(Screen.AppGuard.route) },
                    onNavigateToNetworkGuard = { navController.navigate(Screen.NetworkGuard.route) }
                )
            }

            composable(Screen.WebGuard.route) {
                WebGuardScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.MessageGuard.route) {
                MessageGuardScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.MediaGuard.route) {
                MediaGuardScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.AppGuard.route) {
                AppGuardScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.NetworkGuard.route) {
                NetworkGuardScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Investigations.route) {
                InvestigationsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}

@Composable
fun AegisosBottomNavigationBar(
    items: List<BottomNavItem>,
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val guardRoutes = listOf(
        Screen.Guard.route,
        Screen.WebGuard.route,
        Screen.MessageGuard.route,
        Screen.MediaGuard.route,
        Screen.AppGuard.route,
        Screen.NetworkGuard.route
    )

    NavigationBar(
        modifier = modifier,
        containerColor = Surface,
        contentColor = TextPrimary
    ) {
        items.forEach { item ->
            val selected = when (item.route) {
                Screen.Guard.route -> currentRoute in guardRoutes
                else -> currentRoute == item.route
            }
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.title
                    )
                },
                label = {
                    Text(text = item.title)
                },
                selected = selected,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = AegisCyan,
                    selectedTextColor = AegisCyan,
                    indicatorColor = Card,
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted
                )
            )
        }
    }
}
