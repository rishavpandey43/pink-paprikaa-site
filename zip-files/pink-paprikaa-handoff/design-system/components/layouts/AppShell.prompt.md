Wraps every app screen so sheets and toasts position correctly.

    <AppShell statusTone="light" tabBar={<TabBar ... />} overlay={sheet}>
      <HomeScreen />
    </AppShell>

The frame is position:relative, which is what Dialog and Toast anchor to. Set statusTone="light" whenever the screen opens on a pink header.
