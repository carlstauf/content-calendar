import { PrismaClient, Platform, Pillar, Status, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays, addHours, startOfWeek, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.jobLog.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.mention.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await hash('password123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@finalround.ai',
      password: hashedPassword,
      name: 'Sarah Chen',
      role: UserRole.admin,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  })

  const editorUser1 = await prisma.user.create({
    data: {
      email: 'editor1@finalround.ai',
      password: hashedPassword,
      name: 'Mike Johnson',
      role: UserRole.editor,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor1'
    }
  })

  const editorUser2 = await prisma.user.create({
    data: {
      email: 'editor2@finalround.ai',
      password: hashedPassword,
      name: 'Emily Davis',
      role: UserRole.editor,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor2'
    }
  })

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@finalround.ai',
      password: hashedPassword,
      name: 'Alex Thompson',
      role: UserRole.viewer,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer'
    }
  })

  console.log('✅ Created users')

  // Helper function to generate content
  const generateContent = (platform: Platform, pillar: Pillar): { title: string; description: string } => {
    const contentMap = {
      [Platform.LinkedIn]: {
        [Pillar.IndustryInsights]: {
          title: 'AI Trends in Enterprise Software',
          description: `<p>The latest developments in AI are transforming how enterprises operate. Here are 3 key trends:</p>
<ul>
<li>Automated workflow optimization</li>
<li>Predictive analytics for decision making</li>
<li>Natural language interfaces</li>
</ul>
<p>What trends are you seeing in your industry?</p>`
        },
        [Pillar.ProductUpdates]: {
          title: 'New Feature: Smart Scheduling Assistant',
          description: `<p>Excited to announce our AI-powered scheduling assistant! 🚀</p>
<p>Key features:</p>
<ul>
<li>Automatically suggests optimal posting times</li>
<li>Considers your audience engagement patterns</li>
<li>Integrates with your calendar</li>
</ul>
<p>Try it out and let us know what you think!</p>`
        },
        [Pillar.StartupRun]: {
          title: 'Lessons from Our Series A Journey',
          description: `<p>Just closed our Series A! Here's what we learned:</p>
<ol>
<li>Start fundraising 6 months before you need to</li>
<li>Focus on metrics that matter to investors</li>
<li>Build relationships before you need them</li>
</ol>
<p>Happy to share more details - drop a comment!</p>`
        },
        [Pillar.Life]: {
          title: 'Work-Life Balance in a Startup',
          description: `<p>Finding balance while building a company is tough but essential.</p>
<p>My top 3 strategies:</p>
<ul>
<li>Time-boxing deep work sessions</li>
<li>Non-negotiable exercise time</li>
<li>Weekly digital detox</li>
</ul>
<p>What helps you maintain balance?</p>`
        }
      },
      [Platform.X]: {
        [Pillar.IndustryInsights]: {
          title: 'AI is eating software',
          description: `AI isn't just a feature anymore - it's becoming the foundation.

Thread on what this means for developers 🧵👇`
        },
        [Pillar.ProductUpdates]: {
          title: 'Shipped: Dark mode 🌙',
          description: `Your eyes can thank us later.

Dark mode is now live across all Final Round AI products!

Screenshot in replies 👇`
        },
        [Pillar.StartupRun]: {
          title: 'Hot take on remote work',
          description: `Remote work isn't about location - it's about async communication.

Once you master async, location becomes irrelevant.`
        },
        [Pillar.Life]: {
          title: 'Morning routine that changed everything',
          description: `5:30 AM wake up
20 min meditation
30 min exercise
No phone until 8 AM

Game changer.`
        }
      },
      [Platform.TikTok]: {
        [Pillar.IndustryInsights]: {
          title: 'Tech trends you can\'t ignore',
          description: `POV: You're still not using AI in your workflow 🤖

Here are 3 tools that will 10x your productivity...`
        },
        [Pillar.ProductUpdates]: {
          title: 'New feature alert! 🚨',
          description: `Wait till you see what we just shipped...

Hint: It involves AI and your calendar 📅✨`
        },
        [Pillar.StartupRun]: {
          title: 'Day in the life of a startup founder',
          description: `6 AM: Coffee & emails
9 AM: Team standup
12 PM: Customer calls
3 PM: Product review
6 PM: More coffee
9 PM: Still working 😅`
        },
        [Pillar.Life]: {
          title: 'Burnout is real - here\'s how I cope',
          description: `Signs you need a break:
- Everything feels urgent
- Can't focus
- Always tired

My recovery routine in comments 👇`
        }
      },
      [Platform.Instagram]: {
        [Pillar.IndustryInsights]: {
          title: 'Future of work is here',
          description: `Swipe to see how AI is transforming the workplace 👉

From automated scheduling to intelligent insights, the future is now.

What AI tools are you using? Comment below!`
        },
        [Pillar.ProductUpdates]: {
          title: 'Big announcement! 🎉',
          description: `We've been working on something special...

Introducing: Final Round AI Content Calendar 📅

Never miss a post again. Link in bio!`
        },
        [Pillar.StartupRun]: {
          title: 'Behind the scenes',
          description: `Building in public has its challenges, but the community support makes it worth it.

Today's wins and lessons in the carousel 👉`
        },
        [Pillar.Life]: {
          title: 'Sunday reset routine',
          description: `How I prepare for a productive week:

📝 Review last week
🎯 Set top 3 goals
🧹 Clean workspace
🧘 Meditate
📚 Read for 30 min

What's your Sunday routine?`
        }
      }
    }

    return contentMap[platform][pillar]
  }

  // Create posts for the next 30 days
  const startDate = startOfWeek(new Date())
  const posts = []
  const platforms = Object.values(Platform)
  const pillars = Object.values(Pillar)
  const users = [editorUser1, editorUser2]

  for (let day = 0; day < 30; day++) {
    const currentDate = addDays(startDate, day)
    
    // 2-3 posts per day
    const postsPerDay = Math.floor(Math.random() * 2) + 2
    
    for (let i = 0; i < postsPerDay; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      const pillar = pillars[Math.floor(Math.random() * pillars.length)]
      const assignee = users[Math.floor(Math.random() * users.length)]
      const content = generateContent(platform, pillar)
      
      // Vary publish times
      const publishDate = addHours(currentDate, 9 + Math.floor(Math.random() * 10))
      
      // Some posts are already published (past dates)
      const isPast = publishDate < new Date()
      const status = isPast ? Status.Published : (Math.random() > 0.8 ? Status.Draft : Status.Scheduled)
      
      posts.push({
        ...content,
        platform,
        pillar,
        publishDate,
        status,
        assigneeId: assignee.id,
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/seed/${day}-${i}/1080/1080` : null
      })
    }
  }

  // Create posts
  for (const post of posts) {
    await prisma.post.create({ data: post })
  }

  console.log(`✅ Created ${posts.length} posts`)

  // Add comments to some posts
  const allPosts = await prisma.post.findMany({ 
    where: { status: Status.Published },
    take: 10 
  })

  for (const post of allPosts) {
    const commentCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < commentCount; i++) {
      const author = users[Math.floor(Math.random() * users.length)]
      const comments = [
        'Great insights! This really resonates with our experience.',
        'Love this approach. We implemented something similar last quarter.',
        'Interesting perspective. Have you considered the impact on smaller teams?',
        `Thanks for sharing! @${editorUser1.name} what are your thoughts on this?`,
        'This is exactly what we needed to hear. Bookmarking for later!',
      ]
      
      const comment = await prisma.comment.create({
        data: {
          content: comments[Math.floor(Math.random() * comments.length)],
          postId: post.id,
          authorId: author.id
        }
      })

      // Add mentions if comment contains @
      if (comment.content.includes('@')) {
        await prisma.mention.create({
          data: {
            commentId: comment.id,
            userId: editorUser1.id
          }
        })
      }
    }
  }

  console.log('✅ Created comments and mentions')

  // Add some job logs
  const jobTypes = ['publish_post', 'send_notification', 'compress_image', 'generate_suggestions']
  const jobStatuses = ['completed', 'failed', 'pending']

  for (let i = 0; i < 20; i++) {
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)]
    const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)]
    
    await prisma.jobLog.create({
      data: {
        jobType,
        status,
        jobData: {
          postId: allPosts[Math.floor(Math.random() * allPosts.length)]?.id,
          timestamp: new Date().toISOString()
        },
        error: status === 'failed' ? 'Connection timeout' : null,
        completedAt: status === 'completed' ? new Date() : null,
        createdAt: subDays(new Date(), Math.floor(Math.random() * 7))
      }
    })
  }

  console.log('✅ Created job logs')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })