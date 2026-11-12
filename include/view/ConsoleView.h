#pragma once

#include "view/IPlayerView.h"

namespace smartdj {

class ConsoleView final : public IPlayerView {
public:
    void showStatus(const std::string& message) override;
    void showProgress(const std::string& action, float progress) override;
};

} // namespace smartdj

