#include "view/ConsoleView.h"
#include <iostream>

namespace smartdj {
void ConsoleView::showStatus(const std::string& message) { std::cout << "\n[Smart DJ] " << message << '\n'; }
void ConsoleView::showProgress(const std::string& action, float progress) { std::cout << action << " [" << static_cast<int>(progress * 100) << "%]\n"; }
} // namespace smartdj

