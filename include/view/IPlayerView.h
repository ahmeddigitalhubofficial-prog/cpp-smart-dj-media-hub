#pragma once

#include <string>

namespace smartdj {

class IPlayerView {
public:
    virtual ~IPlayerView() = default;
    virtual void showStatus(const std::string& message) = 0;
    virtual void showProgress(const std::string& action, float progress) = 0;
};

} // namespace smartdj

