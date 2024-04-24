<template>
  <div class="w-full min-h-full p-3 box-border">
    <TabGroup @change="handleTabChange">
      <TabList class="flex space-x-1 rounded-lg bg-[hsl(240,4.8%,95.9%)] p-1">
        <Tab v-slot="{ selected }" v-for="tab in tabs" as="template">
          <button
            :class="[btnCls, 'grow py-1 mr-1', selected ? 'bg-white text-[hsl(240,10%,3.9%)]' : 'bg-transparent text-[hsl(240,3.8%,46.1%)] hover:bg-white/[0.12]']">
            {{ tab }}
          </button>
        </Tab>
      </TabList>
      <TabPanels class="p-1 box-border">
        <TabPanel class="mt-3">
          <textarea
            class="w-full outline-none border-1 rounded-lg border-gray-300 box-border p-2 min-h-20rem text-slate-900 resize-none"
            v-model="mdStr" />
        </TabPanel>
        <TabPanel>
          <div class="min-h-20rem overflow-auto text-slate-900 p-1">
            <div v-if="!resultHtml" class="text-sm h-10 flex items-center justify-center">
              {{ mdStr ? 'Rendering..' : 'Nothing..' }}
            </div>
            <div v-else v-html="resultHtml"></div>
          </div>
        </TabPanel>
      </TabPanels>
      <div class="w-full text-center p-1 mt-1 box-border flex items-center">
        <Menu as="div" class="relative inline-block text-left mr-3">
          <div>
            <MenuButton
              class="text-slate-900 ring-1 ring-gray-300 bg-white cursor-pointer outline-none border-none inline-flex justify-center items-center rounded-lg pl-4 pr-3 py-2 text-sm font-medium">
              <div class="truncate">{{ currTheme }}</div>
              <i class="inline-block i-mdi-chevron-down ml-1"></i>
            </MenuButton>
          </div>

          <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
              class="absolute bottom-10 left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div class="px-1 py-1" v-for="theme in themes">
                <MenuItem @click="currTheme = theme">
                <button :class="{ 'important:bg-gray-200': currTheme === theme }"
                  class="w-full border-none bg-transparent hover:bg-gray-100 p-1 rounded cursor-pointer">
                  {{ theme }}
                </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
        <button :class="btnCls"
          class="inline-block w-full bg-black text-white hover:bg-gray-800 active:bg-gray-600 py-2"
          @click="insertHTMLAtCursor()">Ready</button>
      </div>
    </TabGroup>
  </div>
</template>

<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { markdownItTable } from 'markdown-it-table'
import Shiki from '@shikijs/markdown-it'

const md = MarkdownIt({
  html: true
})
md.use(markdownItTable)

const tabs = ['MD', "HTML"]
const themes = ['github-dark', 'nord', 'min-dark', 'dark-plus', 'one-dark-pro']
const btnCls = 'rounded-lg text-sm font-medium leading-5 outline-none border-none cursor-pointer'
const mdStr = ref('')
const resultHtml = ref('')
const currTheme = ref('nord')

async function insertHTMLAtCursor() {
  await genHtml()
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'teleport', html: resultHtml.value }, (resp) => {
      if (resp === 'SUCCESS') {
        window.close()
      } else {
        alert("Insufficient mana! Failed to teleport :/")
      }
    })
  }
}

async function genHtml() {
  resultHtml.value = ''
  md.use(await Shiki({ theme: currTheme.value }))
  resultHtml.value = beautify(md.render(mdStr.value))
}

function handleTabChange(target) {
  if (target) {
    genHtml()
  }
}

function beautify(html) {
  const div = document.createElement("div")
  div.innerHTML = html

  // tables
  const tables = div.querySelectorAll('table')
  for (const table of tables) {
    table.outerHTML = `<div style="border: 1px solid rgba(0, 0, 0, .37);border-radius: 5px;width: fit-content;margin: 6px 0;">${table.outerHTML}</div>`
  }

  // tds
  const tds = div.querySelectorAll('td')
  for (const td of tds) {
    td.style.borderTop = '1px solid rgba(0, 0, 0, .37)'
    td.style.padding = 'padding: 8px'
  }
  const tdThsExceptForLast = div.querySelectorAll('td:nth-last-child(n+2), th:nth-last-child(n+2)')
  for (const tdTh of tdThsExceptForLast) {
    tdTh.style.borderRight = '1px solid rgba(0, 0, 0, .37)'
  }

  // inline codes
  const inlineCodes = div.querySelectorAll('p>code')
  for (const inlineCode of inlineCodes) {
    inlineCode.style.backgroundColor = '#f9f2f4'
    inlineCode.style.borderRadius = '5px'
    inlineCode.style.fontSize = 'small'
    inlineCode.style.padding = '3px 5px'
    inlineCode.style.margin = '0 3px'
    inlineCode.style.color = '#c7254e'
  }

  // codeblocks
  const codeblocksContainers = div.querySelectorAll('pre:has(>code)')
  for (const codeblocksContainer of codeblocksContainers) {
    codeblocksContainer.style.overflow = 'hidden'
    codeblocksContainer.style.borderRadius = '6px'
    codeblocksContainer.style.margin = '6px 0'

    // the codeblock
    const codeblock = codeblocksContainer.querySelector('code:has(>span)')
    codeblock.style.display = 'block'
    codeblock.style.overflow = 'auto'
    codeblock.style.fontSize = 'small'
    codeblock.style.padding = '8px 12px'
  }

  // reference
  const blockquotes = div.querySelectorAll('blockquote')
  for (const blockquote of blockquotes) {
    blockquote.style.margin = 'auto'
    blockquote.style.paddingLeft = '16px'
    blockquote.style.borderLeft = '3px solid #94a3b8'
    blockquote.style.fontSize = 'small'
  }

  return div.innerHTML
}

watch(currTheme, genHtml)

onMounted(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'init' }, () => { })
  }
})
</script>
